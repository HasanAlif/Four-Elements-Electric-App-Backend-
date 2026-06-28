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

// One maintenance task's reminder state. Dedicated per-field dates because the
// document-level updatedAt changes on every save and can't track per-task cadence.
const maintenanceAlertSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    enabledAt: { type: Date, default: null },
    nextDueAt: { type: Date, default: null },
    lastSentAt: { type: Date, default: null },
  },
  { _id: false },
);

// Keyed by the 7 fieldKeys from the maintenance config map (map-driven — adding a task
// in maintenanceAlerts.constant.ts automatically extends this sub-document).
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
      select: 0, //  works for all normal Mongoose queries (find, findOne, findById, etc.) Does NOT work for aggregation.
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

    // The user's single active FCM device token (array holds only the latest; replaced on each login/registration).
    fcmTokens: {
      type: [String],
      default: [],
    },

    // Per-task home-maintenance reminder state. select:false keeps it out of every
    // normal user response (profile/find); the cron reads it via an explicit select.
    maintenanceAlerts: {
      type: maintenanceAlertsSchema,
      select: false,
      default: () => ({}),
    },
  },
  { timestamps: true, versionKey: false },
);

// Custom hooks/methods

// Hash password before saving
userSchema.pre('save', async function (this: IUser) {
  // only hash if new user OR password modified
  if (this.isNew || this.isModified('password')) {
    if (!this.password && this.authProvider === AUTH_PROVIDER.EMAIL) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Password is required!');
    }

    if (!this.password) return;

    // 🔑 hash password
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds),
    );

    // ⏱️ set password changed time
    if (!this.isModified('passwordChangedAt')) {
      this.passwordChangedAt = new Date();
    }
  }
});

// Clear password after saving
userSchema.post('save', function (doc: IUser, next) {
  if (doc) {
    doc.password = '';
  }
  next();
});

// This makes problem hiding password while gettting user for checking password verification
// userSchema.post('find', function (doc, next) {
//   if (doc) {
//     doc.password = '';
//   }
//   next();
// });

// userSchema.post('findOne', function (doc, next) {
//   if (doc) {
//     doc.password = '';
//   }
//   next();
// });

// Remove deleted documents from find queries

// all find queries
userSchema.pre(/^find/, function (this: Query<IUser, IUser>) {
  // only return non-deleted users
  this.where({ isDeleted: { $ne: true } });
});

//  single find query
// userSchema.pre('find', function (next) {
//   this.find({ isDeleted: { $ne: true } });
//   next();
// });

//  findOne query
// userSchema.pre('findOne', function (next) {
//   this.find({ isDeleted: { $ne: true } });
//   next();
// });

// aggregation query select: 0 Does NOT work for aggregation
userSchema.pre('aggregate', function (this: Aggregate<IUser>) {
  const pipeline = this.pipeline();

  // Always exclude soft-deleted users
  pipeline.unshift({ $match: { isDeleted: { $ne: true } } });

  // Always remove password field from aggregation results
  const projectStage = {
    password: 0,
    // passwordChangedAt: 0,
    otp: 0,
    otpExpiry: 0,
    maintenanceAlerts: 0,
    // isVerifiedByOTP: 0,
    // isActive: 0,
    // isDeleted: 0,
    // deactivationReason: 0,
    // role: 0,
    // createdAt: 0,
    // updatedAt: 0,
  };

  pipeline.unshift({ $project: projectStage });
});

// isUserExistsByEmailWithPassword
userSchema.statics.isUserExistsByEmailWithPassword = async function (
  email: string,
): Promise<IUser | null> {
  return await UserModel.findOne({ email }).select('+password');
};

// isPasswordMatched
userSchema.methods.isPasswordMatched = async function (
  plainTextPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, this.password);
};

// isJWTIssuedBeforePasswordChanged
userSchema.methods.isJWTIssuedBeforePasswordChanged = function (
  jwtIssuedTimestamp: number,
): boolean {
  // if password not changed after jwt issue timestamp
  if (!this.passwordChangedAt) return false;

  const passwordChangedTime = new Date(this.passwordChangedAt).getTime() / 1000;

  return passwordChangedTime > jwtIssuedTimestamp;
};

// Indexes for the daily maintenance cron's eligibility query (enabled + due) — one
// compound index per task key, matching the $or-over-keys query in the scan.
MAINTENANCE_FIELD_KEYS.forEach(key => {
  userSchema.index({
    [`maintenanceAlerts.${key}.enabled`]: 1,
    [`maintenanceAlerts.${key}.nextDueAt`]: 1,
  });
});

const UserModel = model<IUser, IUserModel>('User', userSchema);

export default UserModel;
