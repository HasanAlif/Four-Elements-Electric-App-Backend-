import { Document, Types } from 'mongoose';

export interface IAddress extends Document {
  _id: Types.ObjectId;

  user: Types.ObjectId;
  addressName: string;
  streetAddress: string;
  apartmentUnit?: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date;
}
