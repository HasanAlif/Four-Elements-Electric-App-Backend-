import { Document, Model, Types } from 'mongoose';
import { TAuthProvider, TRole } from './user.constant';
import type { MaintenanceFieldKey } from '../MaintenanceAlerts/maintenanceAlerts.constant';

export type TUserAddress = {
  addressName: string;
  streetAddress: string;
  apartmentUnit?: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
};

export type TMaintenanceAlert = {
  enabled: boolean;
  enabledAt: Date | null;
  nextDueAt: Date | null;
  lastSentAt: Date | null;
};

export type TMaintenanceAlerts = Record<MaintenanceFieldKey, TMaintenanceAlert>;

export interface IUser extends Document {
  _id: Types.ObjectId;

  name: string;
  firstName?: string;
  lastName?: string;
  address: string;
  phone: string;
  image: string;
  addresses?: TUserAddress[];

  email?: string;
  password?: string;
  passwordChangedAt?: Date;

  otp?: string;
  otpExpiry?: Date;
  isVerifiedByOTP: boolean;

  authProvider: TAuthProvider;
  googleId?: string;
  appleId?: string;

  role: TRole;
  isActive: boolean;
  isSuspended: boolean;
  isDeleted: boolean;
  deactivationReason?: string;

  fcmTokens?: string[];

  maintenanceAlerts?: TMaintenanceAlerts;

  createdAt: Date;
  updatedAt: Date;

  isPasswordMatched(plainTextPassword: string): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    jwtIssuedTimestamp: number | undefined,
  ): boolean;
}

export interface IUserModel extends Model<IUser> {
  isUserExistsByEmailWithPassword(email: string): Promise<IUser | null>;
}
