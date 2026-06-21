import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export const LIGHTING_INSTALL_TYPES = [
  'New Installation',
  'Replacement',
] as const;
export type TLightingInstallType = (typeof LIGHTING_INSTALL_TYPES)[number];

export const LIGHTING_SWITCH_CONNECTIONS = ['New', 'Existing'] as const;
export type TLightingSwitchConnection =
  (typeof LIGHTING_SWITCH_CONNECTIONS)[number];

export interface ILighting extends Document {
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

  lightingType?: string;
  typeOfInteriorLightingFixture?: string;
  kindOfLightingFixture?: string;
  isFixtureHaveComplexAssembly?: boolean;
  isNewOrReplacement?: TLightingInstallType;
  photosOfWhereWantToInstall: string[];
  photosOfCurrentLightFixture: string[];
  photosOfNewLightFixture: string[];
  photosOfInstallationAreaFloodLight: string[];
  photosOfCurrentFloodLight: string[];
  photosOfNewFloodLight: string[];
  tallOfCeiling?: string;
  heightOfFloodLightInstallation?: string;
  detailsOnTypeOfFixture?: string;
  willProvideNewLight?: boolean;
  typeOfSurfaceLightWillMountedTo?: string;
  fixtureConnectedToNewOrExistingSwitch?: TLightingSwitchConnection;
  kindOfSwitchWant?: string;
  wantToUpgradeSwitch?: boolean;
  moreThanOneSwitchLocation?: boolean;
  willProvideNewFloodLight?: boolean;
  floodLightControlledBy?: string;
  detailsOnTypeOfFloodLight?: string;
  detailsOnTypeOfNewWallLightWantToProvide?: string;
  detailsOnPoolAreaLightWantToProvide?: string;
  farFromHouseForDrivewayLighting?: string;
  howDrivewayLightWillControlled?: string;
  farFromHousePoolAreaLighting?: string;
  howPoolAreaLightWillControlled?: string;
  landscapeLightingDetails?: string;
  informationAboutLandscapeProject?: string;
  additionalInformation?: string;

  status: TServiceStatus;
  internalNote: string;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
