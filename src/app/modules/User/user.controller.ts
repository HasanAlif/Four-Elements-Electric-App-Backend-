import httpStatus from 'http-status';
import { AppError, asyncHandler } from '../../utils';
import { UserService } from './user.service';
import { sendResponse } from '../../utils';
import { otpExpiryMinutes } from './user.constant';

// 1. createUser
const createUser = asyncHandler(async (req, res) => {
  const result = await UserService.createUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP sent successfully, verify your account in 5 minutes!',
    data: result,
  });
});

// 2. sendSignupOtpAgain
const sendSignupOtpAgain = asyncHandler(async (req, res) => {
  const userEmail = req.body.userEmail;
  const result = await UserService.sendSignupOtpAgainIntoDB(userEmail);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: `OTP sent again successfully, verify in ${otpExpiryMinutes} minutes!`,
    data: result,
  });
});

// 3. verifySignupOtp
const verifySignupOtp = asyncHandler(async (req, res) => {
  const userEmail = req.body.userEmail;
  const otp = req.body.otp;
  const result = await UserService.verifySignupOtpIntoDB(
    userEmail,
    otp,
    req.body.fcmToken,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'OTP verified successfully!',
    data: result,
  });
});

// 4. signin
const signin = asyncHandler(async (req, res) => {
  const result = await UserService.signinIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Signin successful!',
    data: result,
  });
});

// 5. socialSignin
const socialSignin = asyncHandler(async (req, res) => {
  const result = await UserService.socialSigninIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Social signin successful!',
    data: result,
  });
});

// 6. updateProfilePhoto
const updateProfilePhoto = asyncHandler(async (req, res) => {
  const result = await UserService.updateProfilePhotoIntoDB(req.user, req.file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Photo updated successfully!',
    data: result,
  });
});

// 6. updateUserData
const updateUserData = asyncHandler(async (req, res) => {
  const result = await UserService.updateUserDataIntoDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Data updated successfully!',
    data: result,
  });
});

// 7. changePassword
const changePassword = asyncHandler(async (req, res) => {
  const result = await UserService.changePasswordIntoDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password changed successfully!',
    data: result,
  });
});

// 8. forgotPassword
const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const result = await UserService.forgotPasswordIntoDB(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message:
      'OTP sent to your email. Please check your spam or junk folder too!',
    data: result,
  });
});

// 9. sendForgotPasswordOtpAgain
const sendForgotPasswordOtpAgain = asyncHandler(async (req, res) => {
  const token = req.body.token;
  const result = await UserService.sendForgotPasswordOtpAgainIntoDB(token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP sent again. Please check your spam or junk folder too!',
    data: result,
  });
});

// 10. verifyOtpForForgotPassword
const verifyOtpForForgotPassword = asyncHandler(async (req, res) => {
  const result = await UserService.verifyOtpForForgotPasswordIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP verified successfully!',
    data: result,
  });
});

// 11. resetPassword
const resetPassword = asyncHandler(async (req, res) => {
  const result = await UserService.resetPasswordIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password has been reset successfully!',
    data: result,
  });
});

// 12. fetchProfile
const fetchProfile = asyncHandler(async (req, res) => {
  const result = await UserService.fetchProfileFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile data retrieved successfully!',
    data: result,
  });
});

// 13. getNewAccessToken
const getNewAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.headers.authorization?.replace('Bearer ', '');

  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Refresh token is required!');
  }

  const result = await UserService.getNewAccessTokenFromDB(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Access token fetched successfully!',
    data: result,
  });
});

// 14. deactivateUserAccount
const deactivateUserAccount = asyncHandler(async (req, res) => {
  const result = await UserService.deactivateAccountIntoDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Account deactivated successfully!',
    data: result,
  });
});

// 15. deleteSpecificAccount
const deleteSpecificUserAccount = asyncHandler(async (req, res) => {
  const result = await UserService.deleteSpecificUserAccountIntoDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Account deleted successfully!',
    data: result,
  });
});

// 16. adminGetAllUsers
const adminGetAllUsers = asyncHandler(async (req, res) => {
  const result = await UserService.adminGetAllUsersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Users fetched successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// 17. uploadImages
const uploadImages = asyncHandler(async (req, res) => {
  const files = Array.isArray(req.files)
    ? req.files
    : (req.files && Object.values(req.files).flat()) || undefined;

  const result = await UserService.uploadImagesIntoDB(files);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Images uploaded successfully!',
    data: result,
  });
});

//18. uploadPdf
const uploadPdf = asyncHandler(async (req, res) => {
  const files = Array.isArray(req.files)
    ? req.files
    : (req.files && Object.values(req.files).flat()) || undefined;

  const result = await UserService.uploadPdfIntoDB(files);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'PDFs uploaded successfully!',
    data: result,
  });
});

// 19. deleteImage
const deleteImage = asyncHandler(async (req, res) => {
  const result = await UserService.deleteImageFromDB(
    req.body.imageUrl as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Image deleted successfully!',
    data: result,
  });
});

// 20. addFcmToken
const addFcmToken = asyncHandler(async (req, res) => {
  const result = await UserService.addFcmTokenIntoDB(
    req.user._id.toString(),
    req.body.fcmToken as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Device registered for notifications!',
    data: result,
  });
});

// 21. removeFcmToken
const removeFcmToken = asyncHandler(async (req, res) => {
  const result = await UserService.removeFcmTokenFromDB(
    req.user._id.toString(),
    req.body.fcmToken as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Device unregistered from notifications!',
    data: result,
  });
});

// 22. appleSignin
// Controller is intentionally thin — it owns the error-translation boundary.
// verifyAppleIdentityToken is the only call that can throw a jose error;
// wrapping ONLY that call keeps the catch scope minimal and precise.
const appleSignin = asyncHandler(async (req, res) => {
  const { identityToken, fullName, fcmToken } = req.body as {
    identityToken: string;
    fullName?: string;
    fcmToken?: string;
  };

  // Phase 2: verify signature — translate any Apple / jose failure to 401.
  let applePayload: Awaited<
    ReturnType<typeof UserService.verifyAppleIdentityToken>
  >;
  try {
    applePayload = await UserService.verifyAppleIdentityToken(identityToken);
  } catch (err) {
    // Re-throw AppErrors (e.g. missing bundle_id config) as-is.
    if (err instanceof AppError) throw err;
    // All other errors are jose verification failures → 401.
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid Apple credential');
  }

  // Phase 3: pure business logic — find-or-create / account-linking.
  const result = await UserService.handleAppleAuthPayload(applePayload, {
    fullName,
    fcmToken,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Apple signin successful!',
    data: result,
  });
});

export const UserController = {
  createUser,
  sendSignupOtpAgain,
  verifySignupOtp,
  signin,
  socialSignin,
  updateProfilePhoto,
  updateUserData,
  changePassword,
  forgotPassword,
  sendForgotPasswordOtpAgain,
  verifyOtpForForgotPassword,
  resetPassword,
  fetchProfile,
  getNewAccessToken,
  deactivateUserAccount,
  deleteSpecificUserAccount,
  adminGetAllUsers,
  uploadImages,
  uploadPdf,
  deleteImage,
  addFcmToken,
  removeFcmToken,
  appleSignin,
};
