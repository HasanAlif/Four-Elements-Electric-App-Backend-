import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export const OUTLET_INSTALL_TYPES = ['New Install', 'Replacement'] as const;
export type TOutletInstallType = (typeof OUTLET_INSTALL_TYPES)[number];

export interface IOutlets extends Document {
  _id: Types.ObjectId;
  qId?: string;

  serviceType: string;
  createdBy: Types.ObjectId;

  fullName: string;
  phoneNumber: string;
  emailAddress?: string;
  preferredContactMethod: TContactMethod;

  streetAddress: string;
  apartmentUnit?: string;
  city: string;
  state: string;
  zipCode: string;

  propertyType: TPropertyType;
  ownershipStatus: TOwnershipStatus;
  timelineUrgency: TTimelineUrgency;

  intendedUseOfOutlets?: string;
  howManyOutletsNeeds?: string;
  newInstallationOrReplacement?: TOutletInstallType;
  photosOfWhereOutletsInstall: string[];
  typeOfOutletsNeed?: string;
  photosOfCurrentOutlets: string[];
  howManyAmps?: string;
  ampsOrVoltsNeeded?: string;
  NEMAConfiguration?: string;
  additionalInformation?: string;

  status: TServiceStatus;
  internalNote: string;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
