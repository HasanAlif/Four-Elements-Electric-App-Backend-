import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export const REMODELING_PANEL_LOCATIONS = [
  'Basement (Finished)',
  'Basement (Unfinished)',
  'Garage (Finished)',
  'Garage (Unfinished)',
  'Other (please specify)',
] as const;
export type TRemodelingPanelLocation =
  (typeof REMODELING_PANEL_LOCATIONS)[number];

export interface IRemodeling extends Document {
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

  panelLocation: TRemodelingPanelLocation;
  remodelingAreas: string;

  hasPlansDrawings: boolean;
  plansDrawings?: string[];
  electricalNeeds: string;

  permitApplied: boolean;
  permitNumber?: string;
  additionalInformation?: string;

  existingSpacePhotos: string[];
  panelPhotos: string[];

  status: TServiceStatus;
  internalNote: string;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
