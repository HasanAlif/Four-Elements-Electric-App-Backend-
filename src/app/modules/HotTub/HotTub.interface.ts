import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export const HOT_TUB_AMPERAGES = [
  '20 amps',
  '30 amps',
  '40 amps',
  '50 amps',
  '60 amps',
  "I'm not sure",
] as const;
export type THotTubAmperage = (typeof HOT_TUB_AMPERAGES)[number];

export const HOT_TUB_LOCATIONS = [
  'Ground',
  'Concrete pad',
  'Concrete patio',
  'Deck (wood)',
] as const;
export type THotTubLocation = (typeof HOT_TUB_LOCATIONS)[number];

export const HOT_TUB_PANEL_LOCATIONS = [
  'Basement (Finished)',
  'Basement (Unfinished)',
  'Garage (Finished)',
  'Garage (Unfinished)',
] as const;
export type THotTubPanelLocation = (typeof HOT_TUB_PANEL_LOCATIONS)[number];

export const HOT_TUB_PANEL_DISTANCE = [
  'Less than 25 ft',
  '25 - 50 ft',
  '50 - 100 ft',
  'More than 100 ft',
  'Unsure',
] as const;
export type THotTubPanelDistance = (typeof HOT_TUB_PANEL_DISTANCE)[number];

export interface IHotTub extends Document {
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

  hasDigitalManual: boolean;
  manualDocument?: string;
  hotTubManufacturer?: string;
  hotTubModelNumber?: string;

  amperageNeeded?: THotTubAmperage;
  location: THotTubLocation;
  panelLocation?: THotTubPanelLocation;
  panelDistance?: THotTubPanelDistance;

  panelPhotos: string[];
  hotTubPhotos: string[];
  receptaclePhotos: string[];

  additionalInformation?: string;

  status: TServiceStatus;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
