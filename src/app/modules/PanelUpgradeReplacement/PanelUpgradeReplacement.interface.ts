import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export const PANEL_SERVICE_TYPES = ['Replacement', 'Upgrade'] as const;
export type TPanelServiceType = (typeof PANEL_SERVICE_TYPES)[number];

export interface IPanelUpgradeReplacement extends Document {
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

  panelServiceType: TPanelServiceType;
  desiredPanelAmperage?: string;

  currentPanelAmperage: string;
  powerFeedType: string;

  panelLocation: string;
  additionalInformation?: string;

  meterPhotos?: string[];
  panelPhotos?: string[];

  status: TServiceStatus;
  internalNote: string;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
