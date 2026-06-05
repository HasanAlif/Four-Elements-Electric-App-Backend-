import { Document, Types } from 'mongoose';
import { TServiceStatus } from '../../constants';

export const REMODELING_CONTACT_METHODS = ['Call', 'Text', 'Email'] as const;
export type TRemodelingPreferredContactMethod =
  (typeof REMODELING_CONTACT_METHODS)[number];

export const REMODELING_PROPERTY_TYPES = [
  'House',
  'Condo',
  'Apartment',
  'Commercial',
] as const;
export type TRemodelingPropertyType =
  (typeof REMODELING_PROPERTY_TYPES)[number];

export const REMODELING_OWNERSHIP_STATUSES = [
  'Owner',
  'Tenant',
  'Property Manager',
  'Other',
] as const;
export type TRemodelingOwnershipStatus =
  (typeof REMODELING_OWNERSHIP_STATUSES)[number];

export const REMODELING_TIMELINE_URGENCIES = [
  'As soon as possible',
  'This week',
  'This month',
  'Flexible',
] as const;
export type TRemodelingTimelineUrgency =
  (typeof REMODELING_TIMELINE_URGENCIES)[number];

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

  serviceType: string;
  createdBy: Types.ObjectId;

  fullName: string;
  phoneNumber: string;
  emailAddress?: string;
  preferredContactMethod: TRemodelingPreferredContactMethod;

  streetAddress: string;
  apartmentUnit?: string;
  city: string;
  state: string;
  zipCode: string;

  propertyType: TRemodelingPropertyType;
  ownershipStatus: TRemodelingOwnershipStatus;
  timelineUrgency: TRemodelingTimelineUrgency;

  panelLocation: TRemodelingPanelLocation;
  remodelingAreas: string;

  hasPlansDrawings: boolean;
  plansDrawings: string[];
  electricalNeeds: string;

  permitApplied: boolean;
  permitNumber?: string;
  additionalInformation?: string;

  existingSpacePhotos: string[];
  panelPhotos: string[];

  status: TServiceStatus;

  createdAt: Date;
  updatedAt: Date;
}
