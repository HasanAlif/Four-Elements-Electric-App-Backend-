import bcrypt from 'bcryptjs';
import { Aggregate, model, Query, Schema } from 'mongoose';
import config from '../../config';
import { AUTH_PROVIDER, defaultUserImage, ROLE } from './user.constant';
import { IUser, IUserModel, TUserAddress } from './user.interface';
import { AppError } from '../../utils';
import httpStatus from 'http-status';
import { MAINTENANCE_FIELD_KEYS } from '../MaintenanceAlerts/maintenanceAlerts.constant';

const userAddressSchema = new Schema<TUserAddress>(
  {
    addressName: { type: String, required: true },
    streetAddress: { type: String, required: true },
    apartmentUnit: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const maintenanceAlertSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    enabledAt: { type: Date, default: null },
    nextDueAt: { type: Date, default: null },
    lastSentAt: { type: Date, default: null },
  },
  { _id: false },
);

const maintenanceAlertsDefinition: Record<
  string,
  { type: typeof maintenanceAlertSchema; default: () => object }
> = {};
for (const key of MAINTENANCE_FIELD_KEYS) {
  maintenanceAlertsDefinition[key] = {
    type: maintenanceAlertSchema,
    default: () => ({}),
  };
}
const maintenanceAlertsSchema = new Schema(maintenanceAlertsDefinition, {
  _id: false,
});

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required!'],
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: 'N/A',
    },
    addresses: {
      type: [userAddressSchema],
      default: [],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, 'Phone is required!'],
    },
    image: {
      type: String,
      default: defaultUserImage,
    },

    email: {
      type: String,
      trim: true,
      required: [true, 'Email is required!'],
      unique: [true, 'This email is already used!'],
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.authProvider === AUTH_PROVIDER.EMAIL;
      },
      select: 0,
    },
    passwordChangedAt: {
      type: Date,
    },

    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    isVerifiedByOTP: {
      type: Boolean,
      default: false,
    },

    authProvider: {
      type: String,
      enum: Object.values(AUTH_PROVIDER),
      default: AUTH_PROVIDER.EMAIL,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    appleId: {
      type: String,
      sparse: true,
    },

    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deactivationReason: {
      type: String,
    },

    fcmTokens: {
      type: [String],
      default: [],
    },

    maintenanceAlerts: {
      type: maintenanceAlertsSchema,
      select: false,
      default: () => ({}),
    },
  },
  { timestamps: true, versionKey: false },
);

userSchema.pre('save', async function (this: IUser) {
  if (this.isNew || this.isModified('password')) {
    if (!this.password && this.authProvider === AUTH_PROVIDER.EMAIL) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Password is required!');
    }

    if (!this.password) return;

    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds),
    );

    if (!this.isModified('passwordChangedAt')) {
      this.passwordChangedAt = new Date();
    }
  }
});

userSchema.post('save', function (doc: IUser, next) {
  if (doc) {
    doc.password = '';
  }
  next();
});

userSchema.pre(/^find/, function (this: Query<IUser, IUser>) {
  this.where({ isDeleted: { $ne: true } });
});

userSchema.pre('aggregate', function (this: Aggregate<IUser>) {
  const pipeline = this.pipeline();

  pipeline.unshift({ $match: { isDeleted: { $ne: true } } });

  const projectStage = {
    password: 0,
    otp: 0,
    otpExpiry: 0,
    maintenanceAlerts: 0,
  };

  pipeline.unshift({ $project: projectStage });
});

userSchema.statics.isUserExistsByEmailWithPassword = async function (
  email: string,
): Promise<IUser | null> {
  return await UserModel.findOne({ email }).select('+password');
};

userSchema.methods.isPasswordMatched = async function (
  plainTextPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, this.password);
};

userSchema.methods.isJWTIssuedBeforePasswordChanged = function (
  jwtIssuedTimestamp: number,
): boolean {
  if (!this.passwordChangedAt) return false;

  const passwordChangedTime = new Date(this.passwordChangedAt).getTime() / 1000;

  return passwordChangedTime > jwtIssuedTimestamp;
};

MAINTENANCE_FIELD_KEYS.forEach(key => {
  userSchema.index({
    [`maintenanceAlerts.${key}.enabled`]: 1,
    [`maintenanceAlerts.${key}.nextDueAt`]: 1,
  });
});

const UserModel = model<IUser, IUserModel>('User', userSchema);

export default UserModel;
