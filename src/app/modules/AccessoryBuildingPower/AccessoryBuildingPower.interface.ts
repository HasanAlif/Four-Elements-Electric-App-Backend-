import { Document, Types } from 'mongoose';
import { TServiceStatus } from '../../constants';

export const ACCESSORY_BUILDING_CONTACT_METHODS = [
  'Call',
  'Text',
  'Email',
] as const;
export type TAccessoryBuildingPreferredContactMethod =
  (typeof ACCESSORY_BUILDING_CONTACT_METHODS)[number];

export const ACCESSORY_BUILDING_PROPERTY_TYPES = [
  'House',
  'Condo',
  'Apartment',
  'Commercial',
] as const;
export type TAccessoryBuildingPropertyType =
  (typeof ACCESSORY_BUILDING_PROPERTY_TYPES)[number];

export const ACCESSORY_BUILDING_OWNERSHIP_STATUSES = [
  'Owner',
  'Tenant',
  'Property Manager',
  'Other',
] as const;
export type TAccessoryBuildingOwnershipStatus =
  (typeof ACCESSORY_BUILDING_OWNERSHIP_STATUSES)[number];

export const ACCESSORY_BUILDING_TIMELINE_URGENCIES = [
  'As soon as possible',
  'This week',
  'This month',
  'Flexible',
] as const;
export type TAccessoryBuildingTimelineUrgency =
  (typeof ACCESSORY_BUILDING_TIMELINE_URGENCIES)[number];

export const ACCESSORY_BUILDING_STATUSES = [
  'Already built or delivered on site',
  'Will be delivered / built soon',
  'Not built yet',
] as const;
export type TAccessoryBuildingStatus =
  (typeof ACCESSORY_BUILDING_STATUSES)[number];

export const ACCESSORY_BUILDING_CONSTRUCTION_TYPES = [
  'Metal / Steel Frame',
  'Pole Barn',
  'Wood (Pre-fabricated)',
  'Wood (built on site)',
] as const;
export type TAccessoryBuildingConstructionType =
  (typeof ACCESSORY_BUILDING_CONSTRUCTION_TYPES)[number];

export const ACCESSORY_BUILDING_FLOOR_TYPES = [
  'Dirt',
  'Stone',
  'Wood',
  'Concrete',
] as const;
export type TAccessoryBuildingFloorType =
  (typeof ACCESSORY_BUILDING_FLOOR_TYPES)[number];

export const ACCESSORY_BUILDING_SERVICE_TYPES = [
  'New Service',
  'Sub-panel',
  '1-2 dedicated circuits',
] as const;
export type TAccessoryBuildingElectricalServiceType =
  (typeof ACCESSORY_BUILDING_SERVICE_TYPES)[number];

export const ACCESSORY_BUILDING_SERVICE_SIZES = [
  '30 amp',
  '50 amp',
  '60 amp',
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
export type TAccessoryBuildingServiceSize =
  (typeof ACCESSORY_BUILDING_SERVICE_SIZES)[number];

export const ACCESSORY_BUILDING_CIRCUIT_COUNTS = ['1', '2'] as const;
export type TAccessoryBuildingCircuitCount =
  (typeof ACCESSORY_BUILDING_CIRCUIT_COUNTS)[number];

export const ACCESSORY_BUILDING_CIRCUIT_AMP_RATINGS = ['15', '20'] as const;
export type TAccessoryBuildingCircuitAmpRating =
  (typeof ACCESSORY_BUILDING_CIRCUIT_AMP_RATINGS)[number];

export const ACCESSORY_BUILDING_PANEL_LOCATIONS = [
  'Basement (Finished)',
  'Basement (Unfinished)',
  'Garage (Finished)',
  'Garage (Unfinished)',
  'Other (please specify)',
] as const;
export type TAccessoryBuildingPanelLocation =
  (typeof ACCESSORY_BUILDING_PANEL_LOCATIONS)[number];

export interface IAccessoryBuildingPower extends Document {
  _id: Types.ObjectId;

  serviceType: string;
  createdBy: Types.ObjectId;

  fullName: string;
  phoneNumber: string;
  emailAddress?: string;
  preferredContactMethod: TAccessoryBuildingPreferredContactMethod;

  streetAddress: string;
  apartmentUnit?: string;
  city: string;
  state: string;
  zipCode: string;

  propertyType: TAccessoryBuildingPropertyType;
  ownershipStatus: TAccessoryBuildingOwnershipStatus;
  timelineUrgency: TAccessoryBuildingTimelineUrgency;

  entireSquareFootage: number;
  intendedUse: string;

  buildingStatus: TAccessoryBuildingStatus;
  constructionType: TAccessoryBuildingConstructionType;
  hasHeatingOrCooling: boolean;
  floorType: TAccessoryBuildingFloorType;

  electricalServiceType: TAccessoryBuildingElectricalServiceType;
  serviceSize?: TAccessoryBuildingServiceSize;
  serviceSizeOther?: string;
  dedicatedCircuitsCount?: TAccessoryBuildingCircuitCount;
  dedicatedCircuitAmpRating?: TAccessoryBuildingCircuitAmpRating;

  panelLocation: TAccessoryBuildingPanelLocation;
  panelLocationOther?: string;

  panelPhotos: string[];
  routeDetails?: string;
  existingSpacePhotos: string[];

  hasPlansDrawings: boolean;
  plansDrawings?: string[];
  permitApplied: boolean;
  permitNumber?: string;
  additionalInformation?: string;

  status: TServiceStatus;

  createdAt: Date;
  updatedAt: Date;
}
