import z from 'zod';
import httpStatus from 'http-status';
import config from '../../config';
import {
  createAccessToken,
  createRefreshToken,
  generateOtp,
  verifyToken,
} from '../../lib';
import { AppError, sendOtpEmail } from '../../utils';
import { IUser } from './user.interface';
import UserModel from './user.model';
import {
  AUTH_PROVIDER,
  defaultUserImage,
  otpExpiryMinutes,
  ROLE,
  TAuthProvider,
  TDeactiveAccountPayload,
  TUpdateUserPayload,
} from './user.constant';
import { UserValidation } from './user.validation';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import {
  deleteImageFromCloudinary,
  sendImageToCloudinary,
  sendPdfToBucket,
} from '../../lib';
import { PipelineStage } from 'mongoose';
import { createPublicKey } from 'crypto';
import { Service_STATUSES } from '../../constants';
import { serviceModels } from '../serviceModels';
import FavoriteModel from '../Quotes/Favorite.model';
import { MAINTENANCE_FIELD_KEYS } from '../MaintenanceAlerts/maintenanceAlerts.constant';

type TSocialSigninPayload = {
  provider: Exclude<TAuthProvider, 'EMAIL'>;
  idToken: string;
  name?: string;
};

type TJwksKey = {
  kid: string;
  kty: string;
  alg?: string;
  use?: string;
  n?: string;
  e?: string;
  crv?: string;
  x?: string;
  y?: string;
};

type TSocialTokenPayload = JwtPayload & {
  sub: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

const jwksCache = new Map<string, TJwksKey[]>();

const getConfiguredClientIds = (
  value: string | undefined,
  provider: string,
) => {
  const clientIds = value
    ?.split(',')
    .map(clientId => clientId.trim())
    .filter(Boolean);

  if (!clientIds?.length) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `${provider} client ID is not configured!`,
    );
  }

  return clientIds as [string, ...string[]];
};

const getJwks = async (jwksUrl: string) => {
  const cachedKeys = jwksCache.get(jwksUrl);
  if (cachedKeys) return cachedKeys;

  const response = await fetch(jwksUrl);

  if (!response.ok) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to verify social ID token!',
    );
  }

  const data = (await response.json()) as { keys: TJwksKey[] };
  jwksCache.set(jwksUrl, data.keys);

  return data.keys;
};

const verifySocialIdToken = async (
  idToken: string,
  provider: Exclude<TAuthProvider, 'EMAIL'>,
): Promise<TSocialTokenPayload> => {
  const decodedHeader = jwt.decode(idToken, { complete: true });

  if (!decodedHeader || typeof decodedHeader === 'string') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid social ID token!');
  }

  const jwksUrl =
    provider === AUTH_PROVIDER.GOOGLE
      ? 'https://www.googleapis.com/oauth2/v3/certs'
      : 'https://appleid.apple.com/auth/keys';

  const issuer =
    provider === AUTH_PROVIDER.GOOGLE
      ? (['accounts.google.com', 'https://accounts.google.com'] as [
          string,
          ...string[],
        ])
      : 'https://appleid.apple.com';

  const audience = getConfiguredClientIds(
    provider === AUTH_PROVIDER.GOOGLE
      ? config.google_client_ids
      : config.apple_client_ids,
    provider,
  );

  const keys = await getJwks(jwksUrl);
  const key = keys.find(item => item.kid === decodedHeader.header.kid);

  if (!key) {
    jwksCache.delete(jwksUrl);
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid social ID token!');
  }

  const publicKey = createPublicKey({
    key: key as JsonWebKey,
    format: 'jwk',
  }).export({
    format: 'pem',
    type: 'spki',
  });

  const decoded = jwt.verify(idToken, publicKey, {
    algorithms: ['RS256'],
    audience,
    issuer,
  }) as TSocialTokenPayload;

  if (!decoded.sub || !decoded.email) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Social ID token must include email!',
    );
  }

  const isEmailVerified =
    decoded.email_verified === true || decoded.email_verified === 'true';

  if (!isEmailVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Social account email is not verified!',
    );
  }

  return decoded;
};

const buildAuthResponse = (user: IUser) => {
  const accessTokenPayload = {
    _id: user._id.toString(),
    name: user.name,
    address: user.address,
    phone: user.phone,
    email: user.email,
    image: user.image || defaultUserImage,
    role: user.role,
  };

  const refreshTokenPayload = {
    email: user.email,
  };

  const accessToken = createAccessToken(accessTokenPayload);
  const refreshToken = createRefreshToken(refreshTokenPayload);

  return {
    accessToken,
    refreshToken,
    user: accessTokenPayload,
  };
};

// 1. createUserIntoDB
const createUserIntoDB = async (payload: IUser & { fcmToken?: string }) => {
  const existingUser = await UserModel.isUserExistsByEmailWithPassword(
    payload.email,
  );

  // if user exists but unverified
  if (existingUser && !existingUser.isVerifiedByOTP) {
    const now = new Date();

    // if OTP expired sending new otp
    if (!existingUser.otpExpiry || existingUser.otpExpiry < now) {
      const otp = generateOtp();
      await sendOtpEmail({ email: payload.email, otp, name: payload.name });

      existingUser.otp = otp;
      existingUser.otpExpiry = new Date(
        now.getTime() + otpExpiryMinutes * 60 * 1000,
      );
      await existingUser.save();

      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have an unverified account, verify it with the new OTP sent to the mail!',
        { isVerified: false },
      );
    } else {
      // if OTP is valid till now
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have an unverified account, verify it now with the otp sent to the mail!',
        { isVerified: false },
      );
    }
  }

  if (existingUser && existingUser.isVerifiedByOTP) {
    // if user is already verified
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exists!');
  }

  if (!existingUser) {
    //  OTP generating and sending if user is new
    const otp = generateOtp();
    await sendOtpEmail({ email: payload?.email, otp, name: payload?.name });

    // Save new user as unverified
    const now = new Date();
    const newUser = await UserModel.create({
      ...payload,
      fcmTokens: payload.fcmToken ? [payload.fcmToken] : [],
      otp,
      otpExpiry: new Date(now.getTime() + otpExpiryMinutes * 60 * 1000),
      isVerifiedByOTP: false,
    });

    return {
      userEmail: newUser.email,
    };
  }
};

// 2. sendSignupOtpAgainIntoDB
const sendSignupOtpAgainIntoDB = async (userEmail: string) => {
  const now = new Date();
  const user = await UserModel.isUserExistsByEmailWithPassword(userEmail);

  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You must sign up first to get an OTP!',
    );
  } else if (user.isVerifiedByOTP) {
    // if user is already verified
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This account is already verified!',
    );
  } else if (!user.otpExpiry || user.otpExpiry < now) {
    // sending new OTP if previous one is expired
    const otp = generateOtp();

    // send OTP via Email
    await sendOtpEmail({ email: user?.email, otp, name: user?.name });

    user.otp = otp;
    user.otpExpiry = new Date(now.getTime() + otpExpiryMinutes * 60 * 1000);
    await user.save();

    return {
      userEmail: user.email,
    };
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'An OTP was already sent. Please wait until it expires before requesting a new one.',
    );
  }
};

// 3. verifySignupOtpIntoDB
const verifySignupOtpIntoDB = async (
  userEmail: string,
  otp: string,
  fcmToken?: string,
) => {
  const now = new Date();
  const user = await UserModel.isUserExistsByEmailWithPassword(userEmail);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Check if the user is already verified
  if (user.isVerifiedByOTP) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This account is already verified!',
    );
  }

  // Check if OTP is expired
  if (!user.otpExpiry || user.otpExpiry < now) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'OTP has been expired. Please request a new one!',
    );
  }

  // If OTP is invalid, throw error
  if (user?.otp !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP!');
  }

  // Mark user as verified
  user.isVerifiedByOTP = true;

  // Replace the stored device token with the one sent at verification (single active token).
  if (fcmToken) {
    user.fcmTokens = [fcmToken];
  }

  await user.save();

  // Prepare user data for token generation
  const accessTokenPayload = {
    _id: user?._id.toString(),
    name: user?.name,
    address: user?.address,
    phone: user?.phone,
    email: user?.email,
    image: user?.image || defaultUserImage,
    role: user?.role,
  };

  const refreshTokenPayload = {
    email: user?.email,
  };

  // tokens
  const accessToken = createAccessToken(accessTokenPayload);
  const refreshToken = createRefreshToken(refreshTokenPayload);

  return {
    accessToken,
    refreshToken,
    user: accessTokenPayload,
  };
};

// 4. signinIntoDB
const signinIntoDB = async (payload: {
  email: string;
  password: string;
  fcmToken?: string;
}) => {
  // const user = await UserModel.findOne({ email: payload.email }).select('+password');
  const user = await UserModel.isUserExistsByEmailWithPassword(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User does not exist!');
  }

  if (!user.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is not active!');
  }

  if (!user.isVerifiedByOTP) {
    const now = new Date();

    // if OTP expired sending new otp
    if (!user.otpExpiry || user.otpExpiry < now) {
      const otp = generateOtp();
      await sendOtpEmail({ email: user?.email, otp, name: user?.name });

      user.otp = otp;
      user.otpExpiry = new Date(now.getTime() + otpExpiryMinutes * 60 * 1000);
      await user.save();

      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have an unverified account, verify it with the new OTP sent to the mail!',
        { isVerified: false },
      );
    } else {
      // if OTP is valid till now
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You have an unverified account, verify it now with the otp sent to the mail!',
        { isVerified: false },
      );
    }
  }

  // Validate password
  const isPasswordCorrect = await user.isPasswordMatched(payload.password);

  if (!isPasswordCorrect) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password not matched!');
  }

  // Replace the user's stored device token with the one sent at login (single active token).
  if (payload.fcmToken) {
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { fcmTokens: [payload.fcmToken] } },
    );
  }

  // Prepare user data for token generation
  const accessTokenPayload = {
    _id: user?._id.toString(),
    name: user?.name,
    address: user?.address,
    phone: user?.phone,
    email: user?.email,
    image: user?.image || defaultUserImage,
    role: user?.role,
  };

  const refreshTokenPayload = {
    email: user?.email,
  };

  // tokens
  const accessToken = createAccessToken(accessTokenPayload);
  const refreshToken = createRefreshToken(refreshTokenPayload);

  return {
    accessToken,
    refreshToken,
    user: accessTokenPayload,
  };
};

// 5. socialSigninIntoDB
const socialSigninIntoDB = async (payload: TSocialSigninPayload) => {
  const decoded = await verifySocialIdToken(payload.idToken, payload.provider);
  const email = decoded.email!.toLowerCase();
  const providerId = decoded.sub;
  const providerIdField =
    payload.provider === AUTH_PROVIDER.GOOGLE ? 'googleId' : 'appleId';

  let user = await UserModel.findOne({ email }).select('+password');

  if (user) {
    if (!user.isActive) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User is not active!');
    }

    user.authProvider =
      user.authProvider === AUTH_PROVIDER.EMAIL
        ? user.authProvider
        : payload.provider;
    user[providerIdField] = providerId;
    user.isVerifiedByOTP = true;

    if (decoded.picture && user.image === defaultUserImage) {
      user.image = decoded.picture;
    }

    await user.save();

    return buildAuthResponse(user);
  }

  const fallbackName = email.split('@')[0];

  user = await UserModel.create({
    name: payload.name || decoded.name || fallbackName,
    phone: 'N/A',
    address: 'N/A',
    email,
    image: decoded.picture || defaultUserImage,
    authProvider: payload.provider,
    [providerIdField]: providerId,
    isVerifiedByOTP: true,
  });

  return buildAuthResponse(user);
};

// 5. updateProfilePhotoIntoDB
const updateProfilePhotoIntoDB = async (
  userData: IUser,
  imageFile: Express.Multer.File | undefined,
) => {
  // 1. Validation: Ensure an image file is provided
  if (!imageFile) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Image is required!');
  }

  // 2. Upload the new profile photo to Cloudinary
  const { secure_url } = await sendImageToCloudinary(imageFile);

  // 3. Update the user's image URL in the database
  const userNewData = await UserModel.findByIdAndUpdate(
    userData._id,
    { image: secure_url },
    { returnDocument: 'after' },
  ).select('name address email image role phone');

  // 4. Rollback Logic: If DB update fails, delete the newly uploaded image from Cloudinary
  if (!userNewData) {
    // Use secure_url to delete from Cloudinary, not the local path
    await deleteImageFromCloudinary(secure_url);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update profile photo. Please try again!',
    );
  }

  // 5. Cleanup: Delete the previous image from Cloudinary if it exists and is not a default image
  if (userData?.image && userData.image !== defaultUserImage) {
    await deleteImageFromCloudinary(userData.image);
  }

  // 6. Prepare payload and Generate a new Access Token with updated data
  const accessTokenPayload = {
    _id: userNewData._id.toString(),
    name: userNewData.name,
    address: userNewData.address,
    phone: userNewData.phone,
    email: userNewData.email,
    image: userNewData.image || defaultUserImage,
    role: userNewData.role,
  };

  const accessToken = createAccessToken(accessTokenPayload);

  return {
    accessToken,
    user: accessTokenPayload,
  };
};

// 6. updateUserDataIntoDB
const updateUserDataIntoDB = async (
  userData: IUser,
  payload: TUpdateUserPayload,
) => {
  const updateData: Record<string, any> = {};

  if (payload.name) updateData.name = payload.name;
  if (payload.address) updateData.address = payload.address;
  if (payload.phone) updateData.phone = payload.phone;

  if (payload.addresses) {
    // Enforce only one isDefault: true in the incoming array
    let defaultFound = false;
    const syncedAddresses = payload.addresses.map(addr => {
      if (addr.isDefault) {
        if (defaultFound) {
          return { ...addr, isDefault: false };
        }
        defaultFound = true;
        return addr;
      }
      return addr;
    });

    updateData.addresses = syncedAddresses;
  }

  const user = await UserModel.findByIdAndUpdate(userData._id, updateData, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Prepare user data for tokens
  const accessTokenPayload = {
    _id: user._id.toString(),
    name: user.name,
    address: user.address,
    phone: user.phone,
    email: user.email,
    image: user.image || defaultUserImage,
    role: user.role,
  };

  const accessToken = createAccessToken(accessTokenPayload);

  return {
    accessToken,
    user: accessTokenPayload,
  };
};

// 7. changePasswordIntoDB
const changePasswordIntoDB = async (
  userData: IUser,
  payload: z.infer<typeof UserValidation.changePasswordSchema.shape.body>,
) => {
  const { oldPassword, newPassword } = payload;

  // select password to use isPasswordMatched method
  const user = await UserModel.findOne({
    _id: userData._id,
    isActive: true,
  }).select('+password');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not exists!'); // auth middleware already handled all checking
  }

  const isCredentialsCorrect = await user.isPasswordMatched(oldPassword);

  if (!isCredentialsCorrect) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Current password is not correct!',
    );
  }

  if (oldPassword === newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'New password must be different!',
    );
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date(Date.now() - 5000); // set 5 second before to avoid isJWTIssuedBeforePasswordChanged issue

  await user.save();

  // Prepare user data for tokens
  const accessTokenPayload = {
    _id: user?._id.toString(),
    name: user?.name,
    address: user?.address,
    phone: user?.phone,
    email: user?.email,
    image: user?.image || defaultUserImage,
    role: user?.role,
  };

  const accessToken = createAccessToken(accessTokenPayload);

  return {
    accessToken,
    // user: accessTokenPayload,
  };
};

// 8. forgotPasswordIntoDB
const forgotPasswordIntoDB = async (email: string) => {
  const user = await UserModel.findOne({ email, isActive: true });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const now = new Date();

  // If OTP exists and not expired, reuse it
  if (user.otp && user.otpExpiry && now < user.otpExpiry) {
    // Do nothing, just reuse existing OTP
    const remainingMs = user.otpExpiry.getTime() - now.getTime();
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

    // await sendOtpEmail({email: user?.email, otp: user?.otp, name: user?.name});

    throw new AppError(
      httpStatus.NOT_FOUND,
      `Last OTP is valid till now, use that in ${remainingMinutes} minutes!`,
    );
  } else {
    // Generate new OTP
    const otp = generateOtp();
    const otpExpiry = new Date(now.getTime() + otpExpiryMinutes * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP
    await sendOtpEmail({ email, otp, name: user?.name });
  }

  // Issue token (just with email)
  const token = jwt.sign({ email }, config.jwt.otp_secret!, {
    expiresIn: config.jwt.otp_secret_expires_in!,
  } as SignOptions);

  return { token };
};

// 9. sendForgotPasswordOtpAgainIntoDB
const sendForgotPasswordOtpAgainIntoDB = async (forgotPassToken: string) => {
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(forgotPassToken, config.jwt.otp_secret!, {
      ignoreExpiration: true,
    }) as JwtPayload;
  } catch {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token!');
  }

  const email = decoded.email as string;

  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token!');
  }

  const user = await UserModel.findOne({ email, isActive: true });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const now = new Date();

  // If OTP exists and not expired, reuse it
  if (user.otp && user.otpExpiry && now < user.otpExpiry) {
    // Do nothing, just reuse existing OTP
    const remainingMs = user.otpExpiry.getTime() - now.getTime();
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

    // await sendOtpEmail({email: user?.email, otp: user?.otp, name: user?.name});

    throw new AppError(
      httpStatus.NOT_FOUND,
      `Last OTP is valid till now, use that in ${remainingMinutes} minutes!`,
    );
  } else {
    // Generate new OTP
    const otp = generateOtp();
    const otpExpiry = new Date(now.getTime() + otpExpiryMinutes * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP
    await sendOtpEmail({ email, otp, name: user?.name });
  }

  return null;
};

// 10. verifyOtpForForgotPasswordIntoDB
const verifyOtpForForgotPasswordIntoDB = async (payload: {
  token: string;
  otp: string;
}) => {
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(payload.token, config.jwt.otp_secret!, {
      ignoreExpiration: true,
    }) as JwtPayload;
  } catch {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token!');
  }

  const email = decoded.email as string;

  const user = await UserModel.findOne({ email, isActive: true });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Check if OTP expired
  if (!user.otp || !user.otpExpiry || Date.now() > user.otpExpiry.getTime()) {
    // Generate and send new OTP
    const newOtp = generateOtp();
    const newExpiry = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);

    user.otp = newOtp;
    user.otpExpiry = newExpiry;
    await user.save();

    await sendOtpEmail({ email, otp: newOtp, name: user?.name });

    throw new AppError(
      httpStatus.BAD_REQUEST,
      'OTP expired. A new OTP has been sent!',
    );
  }

  // Check if OTP matches
  if (user.otp !== payload.otp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP!');
  }

  // OTP verified → issue reset password token
  const resetPasswordToken = jwt.sign(
    {
      email: user.email,
      isResetPassword: true,
    },
    config.jwt.otp_secret!,
    { expiresIn: config.jwt.otp_secret_expires_in! } as SignOptions,
  );

  return { resetPasswordToken };
};

// 11. resetPasswordIntoDB
const resetPasswordIntoDB = async (
  payload: z.infer<typeof UserValidation.resetPasswordSchema.shape.body>,
) => {
  const { resetPasswordToken, newPassword } = payload;

  if (!resetPasswordToken) {
    throw new AppError(httpStatus.FORBIDDEN, 'Invalid reset password token!');
  }

  const resetPasswordPayload = verifyToken(
    resetPasswordToken,
    config.jwt.otp_secret!,
  ) as {
    email: string;
    isResetPassword?: boolean;
  };

  if (!resetPasswordPayload?.isResetPassword) {
    throw new AppError(httpStatus.FORBIDDEN, 'Invalid reset password token!');
  }

  const user = await UserModel.findOne({
    email: resetPasswordPayload.email,
    isActive: true,
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  user.password = newPassword;
  // user.passwordChangedAt = new Date(Date.now());

  // await user.save({ validateBeforeSave: true }) // by default true
  await user.save();

  return null;
};

// 12. fetchProfileFromDB
const fetchProfileFromDB = async (userData: IUser) => {
  const userId = userData._id;

  const [user, quotesCount, savedPartner, alertsHolder] = await Promise.all([
    // Profile projection — same hidden fields as before.
    UserModel.findById(userId)
      .select(
        '-password -passwordChangedAt -otp -otpExpiry -isActive -isDeleted -deactivationReason -createdAt -updatedAt',
      )
      .lean(),
    // Submitted quotes (drafts excluded) across all service collections.
    Promise.all(
      serviceModels.map(serviceModel =>
        serviceModel.countDocuments({
          createdBy: userId,
          status: { $ne: Service_STATUSES.DRAFT },
        }),
      ),
    ).then(counts => counts.reduce((sum, count) => sum + count, 0)),
    // Saved (favorited) partners.
    // Count only favorites whose partner document exists and is active
    FavoriteModel.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: 'partners',
          localField: 'partner',
          foreignField: '_id',
          as: 'partnerDoc',
        },
      },
      { $unwind: { path: '$partnerDoc', preserveNullAndEmptyArrays: false } },
      { $match: { 'partnerDoc.isActive': true } },
      { $count: 'count' },
    ]).then(r => (r && r[0] ? r[0].count : 0)),
    // Reminder states only (select:false → explicit +); kept OUT of the response.
    UserModel.findById(userId).select('+maintenanceAlerts').lean(),
  ]);

  if (!user) {
    return null;
  }

  // Count the maintenance reminders the user has turned on.
  const alerts = (alertsHolder?.maintenanceAlerts ?? {}) as unknown as Record<
    string,
    { enabled?: boolean }
  >;
  const Reminder = MAINTENANCE_FIELD_KEYS.reduce(
    (count, key) => count + (alerts?.[key]?.enabled ? 1 : 0),
    0,
  );

  return { ...user, Quotes: quotesCount, Reminder, savedPartner };
};

// 13. getNewAccessTokenFromDB
const getNewAccessTokenFromDB = async (refreshToken: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(
    refreshToken,
    config.jwt.refresh_secret!,
  ) as JwtPayload;

  const { email, iat } = decoded;

  // checking if the user is exist
  const user = await UserModel.isUserExistsByEmailWithPassword(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not exists!');
  }

  if (!user.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorized!');
  }

  // no need this part as isDeleted is functioned to hide the soft deleted user
  // if (user.isDeleted) {
  //   throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  // }

  if (!user.isVerifiedByOTP) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  // checking if any hacker using a token even-after the user changed the password
  if (user.passwordChangedAt && user.isJWTIssuedBeforePasswordChanged(iat)) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  // Prepare user data for tokens
  const accessTokenPayload = {
    _id: user?._id.toString(),
    name: user?.name,
    address: user?.address,
    phone: user?.phone,
    email: user?.email,
    image: user?.image || defaultUserImage,
    role: user?.role,
  };

  const accessToken = createAccessToken(accessTokenPayload);

  return {
    accessToken,
  };
};

// 14. deactivateAccountIntoDB
const deactivateAccountIntoDB = async (
  userData: IUser,
  payload: TDeactiveAccountPayload,
) => {
  const { email, password, deactivationReason } = payload;

  const currentUser = await UserModel.findOne({
    _id: userData._id,
    email: email,
  }).select('+password');

  if (!currentUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const isPasswordCorrect = currentUser.isPasswordMatched(password);

  if (!isPasswordCorrect) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password not matched!');
  }

  const result = await UserModel.findByIdAndUpdate(
    userData._id,
    {
      $set: {
        isActive: false,
        deactivationReason,
      },
    },
    {
      returnDocument: 'after',
      select: 'email name address isActive deactivationReason',
    },
  );

  return result;
};

// 15. deleteSpecificUserAccountIntoDB
const deleteSpecificUserAccountIntoDB = async (userData: IUser) => {
  const result = await UserModel.findByIdAndUpdate(
    userData._id,
    {
      $set: {
        isDeleted: true,
      },
    },
    { returnDocument: 'after', select: 'email name address isDeleted' },
  );

  return result;
};

// 16. adminGetAllUsersFromDB (using MongoDB aggregation)
const adminGetAllUsersFromDB = async (query: Record<string, unknown>) => {
  const {
    searchTerm,
    sort: sortQuery,
    page: pageQuery,
    limit: limitQuery,
    // fields: fieldsQuery,
    ...rawFilters
  } = query as Record<string, unknown>;

  const page = Number(pageQuery) || 1;
  const limit = Number(limitQuery) || 10;
  const skip = (page - 1) * limit;

  // Base match: exclude admins and super admins
  const matchStage: Record<string, unknown> = {
    role: { $nin: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },
    ...rawFilters,
  };

  const pipeline: PipelineStage[] = [{ $match: matchStage }];

  // Search by name, email, phone
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { phone: { $regex: searchTerm, $options: 'i' } },
          // { address: { $regex: searchTerm, $options: 'i' } },
        ],
      },
    });
  }

  // Sort
  const sortStage: Record<string, 1 | -1> = {};
  const sortString = (sortQuery as string) || '-createdAt';
  sortString
    .split(',')
    .filter(Boolean)
    .forEach((field: string) => {
      if (field.startsWith('-')) {
        sortStage[field.substring(1)] = -1;
      } else {
        sortStage[field] = 1;
      }
    });

  if (Object.keys(sortStage).length) {
    pipeline.push({ $sort: sortStage });
  }

  const facetPipeline: Record<string, PipelineStage.FacetPipelineStage[]> = {
    data: [{ $skip: skip }, { $limit: limit }],
    meta: [{ $count: 'total' }],
  };

  pipeline.push({ $facet: facetPipeline });

  const result = await UserModel.aggregate(pipeline);
  const facetResult = result[0] || { data: [], meta: [] };

  const total = facetResult.meta[0]?.total || 0;
  const totalPage = Math.ceil(total / limit) || 1;

  const meta = {
    page,
    limit,
    total,
    totalPage,
  };

  return { data: facetResult.data, meta };
};

// 17. uploadImagesIntoDB
const uploadImagesIntoDB = async (
  imageFiles: Express.Multer.File[] | undefined,
): Promise<string[]> => {
  if (!imageFiles || imageFiles.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No images provided!');
  }

  const results = await Promise.allSettled(
    imageFiles.map(file => sendImageToCloudinary(file)),
  );

  const imageUrls: string[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      imageUrls.push(result.value.secure_url);
    } else {
      console.error('Cloudinary upload failed for a file:', result.reason);
    }
  }

  if (imageUrls.length === 0) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'All image uploads failed. Please try again!',
    );
  }

  return imageUrls;
};

// 18. uploadPdfIntoDB
const uploadPdfIntoDB = async (
  pdfFiles: Express.Multer.File[] | undefined,
): Promise<string[]> => {
  if (!pdfFiles || pdfFiles.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No pdfs provided!');
  }

  const results = await Promise.allSettled(
    pdfFiles.map(file => sendPdfToBucket(file)),
  );

  const pdfUrls: string[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      pdfUrls.push(result.value);
    } else {
      console.error('GCS upload failed for a PDF file:', result.reason);
    }
  }

  if (pdfUrls.length === 0) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'All pdf uploads failed. Please try again!',
    );
  }

  return pdfUrls;
};

// 19. deleteImageFromDB
const deleteImageFromDB = async (imageUrl: string) => {
  try {
    await deleteImageFromCloudinary(imageUrl);
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
    // Not throwing error to avoid breaking user flow, but logging for debugging
  }
};

// 20. addFcmTokenIntoDB — set the user's single active device token (replaces any previous).
const addFcmTokenIntoDB = async (userId: string, fcmToken: string) => {
  await UserModel.updateOne(
    { _id: userId },
    { $set: { fcmTokens: [fcmToken] } },
  );
  return { fcmToken };
};

// 21. removeFcmTokenFromDB — unregister a device token (called on logout).
const removeFcmTokenFromDB = async (userId: string, fcmToken: string) => {
  await UserModel.updateOne(
    { _id: userId },
    { $pull: { fcmTokens: fcmToken } },
  );
  return { fcmToken };
};

export const UserService = {
  createUserIntoDB,
  sendSignupOtpAgainIntoDB,
  verifySignupOtpIntoDB,
  signinIntoDB,
  socialSigninIntoDB,
  updateProfilePhotoIntoDB,
  updateUserDataIntoDB,
  changePasswordIntoDB,
  forgotPasswordIntoDB,
  sendForgotPasswordOtpAgainIntoDB,
  verifyOtpForForgotPasswordIntoDB,
  resetPasswordIntoDB,
  fetchProfileFromDB,
  getNewAccessTokenFromDB,
  deactivateAccountIntoDB,
  deleteSpecificUserAccountIntoDB,
  adminGetAllUsersFromDB,
  uploadImagesIntoDB,
  uploadPdfIntoDB,
  deleteImageFromDB,
  addFcmTokenIntoDB,
  removeFcmTokenFromDB,
};
