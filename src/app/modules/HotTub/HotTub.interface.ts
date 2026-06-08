import { Document, Types } from 'mongoose';
import { TServiceStatus } from '../../constants';

export const HOT_TUB_CONTACT_METHODS = ['Call', 'Text', 'Email'] as const;
export type THotTubPreferredContactMethod =
  (typeof HOT_TUB_CONTACT_METHODS)[number];

export const HOT_TUB_PROPERTY_TYPES = [
  'House',
  'Condo',
  'Apartment',
  'Commercial',
] as const;
export type THotTubPropertyType = (typeof HOT_TUB_PROPERTY_TYPES)[number];

export const HOT_TUB_OWNERSHIP_STATUSES = [
  'Owner',
  'Tenant',
  'Property Manager',
  'Other',
] as const;
export type THotTubOwnershipStatus =
  (typeof HOT_TUB_OWNERSHIP_STATUSES)[number];

export const HOT_TUB_TIMELINE_URGENCIES = [
  'As soon as possible',
  'This week',
  'This month',
  'Flexible',
] as const;
export type THotTubTimelineUrgency =
  (typeof HOT_TUB_TIMELINE_URGENCIES)[number];

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
  preferredContactMethod: THotTubPreferredContactMethod;

  streetAddress: string;
  apartmentUnit?: string;
  city: string;
  state: string;
  zipCode: string;

  propertyType: THotTubPropertyType;
  ownershipStatus: THotTubOwnershipStatus;
  timelineUrgency: THotTubTimelineUrgency;

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

  createdAt: Date;
  updatedAt: Date;
}
