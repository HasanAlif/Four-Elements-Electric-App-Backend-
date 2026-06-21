import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export const CEILING_FAN_INSTALL_TYPES = [
  'New Install',
  'Replacement',
] as const;
export type TCeilingFanInstallType = (typeof CEILING_FAN_INSTALL_TYPES)[number];

export interface ICellingFans extends Document {
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

  installationType?: TCeilingFanInstallType;
  photosOfCurrentCeilingFan: string[];
  aboveBelowAreaOfCeilingFan?: string;
  isThereCurrentLightFixture?: boolean;
  wasAreaPrewired?: string;
  willProvideNewCeilingFan?: boolean;
  describeFanWantInstalled?: string;
  tallOfCeilingFanFromFloor?: string;
  photosOfNewCeilingFan: string[];
  willConnectNewOrExistingSwitch?: string;
  wantUpgradeSwitch?: boolean;
  kindOfSwitchWant?: string;
  additionalInformation?: string;

  status: TServiceStatus;
  internalNote: string;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
