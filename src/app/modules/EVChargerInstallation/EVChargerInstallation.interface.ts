import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export const EV_CHARGER_CONNECTION_TYPES = [
  'Plug-in',
  'Hardwired',
  'I want help deciding',
] as const;
export type TEVChargerConnectionType =
  (typeof EV_CHARGER_CONNECTION_TYPES)[number];

export const EV_CHARGER_STATUSES = [
  'Currently have the charger',
  'Ordered and waiting on delivery',
  'Need to place order',
  'Need help choosing a charger',
] as const;
export type TEVChargerStatus = (typeof EV_CHARGER_STATUSES)[number];

export const EV_CHARGER_INSTALLATION_LOCATIONS = [
  'Garage',
  'Carport',
  'Driveway',
  'Other',
] as const;
export type TEVChargerInstallationLocation =
  (typeof EV_CHARGER_INSTALLATION_LOCATIONS)[number];

export const EV_CHARGER_PANEL_LOCATIONS = [
  'Basement (Finished)',
  'Basement (Unfinished)',
  'Garage (Finished)',
  'Garage (Unfinished)',
  'Other (please specify)',
] as const;
export type TEVChargerPanelLocation =
  (typeof EV_CHARGER_PANEL_LOCATIONS)[number];

export const EV_CHARGER_DISTANCES = [
  'Less than 25 ft',
  '25-50 ft',
  '50-100 ft',
  'More than 100 ft',
  'Unsure',
] as const;
export type TEVChargerDistance = (typeof EV_CHARGER_DISTANCES)[number];

export interface IEVChargerInstallation extends Document {
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

  chargerConnectionType: TEVChargerConnectionType;
  nemaConfiguration?: string;
  chargerProvidedByUser?: boolean;
  chargerStatus?: TEVChargerStatus;

  installationLocation: TEVChargerInstallationLocation;
  panelLocation: TEVChargerPanelLocation;
  panelDistance: TEVChargerDistance;

  environment?: string;
  budget?: string;
  accessibility?: string;
  schedule?: string;

  additionalInformation?: string;
  areaPhoto?: string;
  panelPhotos: string[];

  status: TServiceStatus;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
