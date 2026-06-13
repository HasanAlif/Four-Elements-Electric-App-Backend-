import { Document, Types } from 'mongoose';
import { TContactMethod, TOwnershipStatus, TPropertyType, TServiceStatus, TTimelineUrgency } from '../../constants';

export const PANEL_SERVICE_TYPES = ['Replacement', 'Upgrade'] as const;
export type TPanelServiceType = (typeof PANEL_SERVICE_TYPES)[number];

export const PANEL_AMPERAGES = [
  '50',
  '60',
  '100',
  '150',
  '200',
  '300',
  '350',
  '400',
  'Unsure',
] as const;
export type TPanelAmperage = (typeof PANEL_AMPERAGES)[number];

export const PANEL_LOCATIONS = [
  'Basement (Finished)',
  'Basement (Unfinished)',
  'Garage (Finished)',
  'Garage (Unfinished)',
  'Other (please specify)',
] as const;
export type TPanelLocation = (typeof PANEL_LOCATIONS)[number];

export const PANEL_POWER_FEEDS = ['Overhead', 'Underground', 'Unsure'] as const;
export type TPowerFeedType = (typeof PANEL_POWER_FEEDS)[number];

export interface IPanelUpgradeReplacement extends Document {
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

  panelServiceType: TPanelServiceType;
  desiredPanelAmperage?: TPanelAmperage;

  currentPanelAmperage: TPanelAmperage;
  powerFeedType: TPowerFeedType;

  panelLocation: TPanelLocation;
  additionalInformation?: string;

  meterPhotos?: string[];
  panelPhotos?: string[];

  status: TServiceStatus;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
