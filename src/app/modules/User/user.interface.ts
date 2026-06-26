import { Document, Model, Types } from 'mongoose';
import { TAuthProvider, TRole } from './user.constant';

export type TUserAddress = {
  addressName: string;
  streetAddress: string;
  apartmentUnit?: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
};

// Instance methods
export interface IUser extends Document {
  _id: Types.ObjectId;

  name: string;
  firstName?: string;
  lastName?: string;
  address: string;
  phone: string;
  image: string;
  addresses?: TUserAddress[];

  email: string;
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

  fcmTokens?: string[]; // registered device tokens for push notifications

  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isPasswordMatched(plainTextPassword: string): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    jwtIssuedTimestamp: number | undefined,
  ): boolean;
}

// Static methods
export interface IUserModel extends Model<IUser> {
  isUserExistsByEmailWithPassword(email: string): Promise<IUser | null>;
}
