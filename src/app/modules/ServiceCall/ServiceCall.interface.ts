import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export const SERVICE_CALL_PREFERRED_TIMES = [
  'AM (8-11)',
  'PM (12-2)',
  'Anytime',
] as const;
export type TServiceCallPreferredTime =
  (typeof SERVICE_CALL_PREFERRED_TIMES)[number];

export interface IServiceCall extends Document {
  _id: Types.ObjectId;

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

  issueDescription: string;
  preferredTime?: TServiceCallPreferredTime;
  schedulingPreference?: string[];

  // installationLocation?: string;
  // chargerOwnership?: string;
  // chargerLevel?: string;
  // panelLocation?: string;
  // distance?: string;
  // environment?: string;
  // accessibility?: string;

  panelPhotos?: string[];
  workAreaPhotos?: string[];
  extraReferencePhotos?: string[];
  notes?: string;
  quickTags: string[];

  status: TServiceStatus;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
