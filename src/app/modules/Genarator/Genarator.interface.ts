import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export interface IGenarator extends Document {
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

  generatorType: string;
  isAlreadyHaveGenerator: boolean;
  generatorOutputPower?: string;
  preferredBackupInstallation?: string;
  generatorDistanceFromInletLocation?: string;
  electricPanelLocation?: string;
  sizeOfGeneratorWanted?: string;
  backupNeeds?: string;
  isHavePropane: boolean;

  photosOfWhereGeneratorWillBeInlet: string[];
  photosOfReceptacleOnGenerator: string[];
  electricPanelPhotos: string[];
  generatorInstallationLocationPhotos: string[];
  photosOfElectricalMeter: string[];

  status: TServiceStatus;
  internalNote: string;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
