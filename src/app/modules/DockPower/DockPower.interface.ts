import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export const DOCK_POWER_SERVICE_TYPES = [
  'New service',
  'Sub-panel',
  '1-2 dedicated circuits',
] as const;
export type TDockPowerElectricalServiceType =
  (typeof DOCK_POWER_SERVICE_TYPES)[number];

export const DOCK_POWER_NEW_SERVICE_SIZES = [
  '100 amp',
  '125 amp',
  '150 amp',
  '200 amp',
  '300 amp',
  '350 amp',
  '400 amp',
  'Unsure',
  'Other',
] as const;
export type TDockPowerNewServiceSize =
  (typeof DOCK_POWER_NEW_SERVICE_SIZES)[number];

export const DOCK_POWER_SUB_PANEL_SIZES = [
  '30 amp',
  '50 amp',
  '60 amp',
  '100 amp',
  '125 amp',
  'Unsure',
  'Other',
] as const;
export type TDockPowerSubPanelSize =
  (typeof DOCK_POWER_SUB_PANEL_SIZES)[number];

export const DOCK_POWER_CIRCUIT_COUNTS = ['1', '2'] as const;
export type TDockPowerCircuitCount = (typeof DOCK_POWER_CIRCUIT_COUNTS)[number];

export const DOCK_POWER_CIRCUIT_AMP_RATINGS = ['15', '20'] as const;
export type TDockPowerCircuitAmpRating =
  (typeof DOCK_POWER_CIRCUIT_AMP_RATINGS)[number];

export const DOCK_POWER_PANEL_LOCATIONS = [
  'Basement (Finished)',
  'Basement (Unfinished)',
  'Garage (Finished)',
  'Garage (Unfinished)',
  'Other (please specify)',
] as const;
export type TDockPowerPanelLocation =
  (typeof DOCK_POWER_PANEL_LOCATIONS)[number];

export interface IDockPower extends Document {
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

  isDockBuilt: boolean;
  electricalNeedsDetails: string;
  receptacleCount: number;

  electricalServiceType: TDockPowerElectricalServiceType;

  newServiceSize?: TDockPowerNewServiceSize;
  serviceSizeOther?: string;

  subPanelSize?: TDockPowerSubPanelSize;

  dedicatedCircuitsCount?: TDockPowerCircuitCount;
  dedicatedCircuitAmpRating?: TDockPowerCircuitAmpRating;

  panelLocation: TDockPowerPanelLocation;
  panelLocationOther?: string;
  panelPhotos: string[];

  privateUtilitiesDetails?: string;
  routeDistanceDetails?: string;
  existingSpacePhotos: string[];

  hasPlansDrawings: boolean;
  plansDrawingsPhotos?: string[];

  permitApplied: boolean;
  permitNumber?: string;

  additionalInformation?: string;

  status: TServiceStatus;
  internalNote: string;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
