import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export const EXHAUST_FAN_INSTALL_TYPES = [
  'New Installation',
  'Replacement',
] as const;
export type TExhaustFanInstallType = (typeof EXHAUST_FAN_INSTALL_TYPES)[number];

export interface IExhaustFans extends Document {
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

  newOrReplacement: TExhaustFanInstallType;
  locationOfExhaustFan?: string;
  isRoofOrGableFan?: string;
  willSupplyAtticFan: boolean;
  photoOfNewFan: string[];
  howManyStories?: number;
  photosOfInstallationArea: string[];
  whereElectricalPanelLocated?: string;
  photosOfPanelCloseUp: string[];
  photosOfPanelWideShot: string[];
  photosOfCurrentKitchenExhaustFan: string[];
  photosOfCurrentBathroomExhaustFan: string[];
  existingDuctAndVentDiameterLocation?: string;
  willProvideKitchenExhaustFan: boolean;
  willProvideBathroomExhaustFan: boolean;
  typeOfExhaustFanWanted?: string;
  specialityControlsWanted?: string;
  aboveBelowAreaOfExhaustFan?: string;
  distanceOfElectricalPanelToExhaustFan?: string;
  additionalInformation?: string;

  status: TServiceStatus;
  internalNote: string;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
