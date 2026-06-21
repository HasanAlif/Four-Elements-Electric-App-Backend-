import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export interface IDedicatedCircuit extends Document {
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

  whyNeedDedicatedCircuit?: string;
  electricalPanelLocation?: string;
  whereWillDedicatedCircuitInstalled?: string;
  aboveBelowArea?: string;
  distanceElectricalPanelToInstallationArea?: string;
  ampsNeeded?: string;
  voltsNeeded?: string;
  NEMAConfiguration?: string;
  additionalInformation?: string;
  photosOfElectricalMeter: string[];
  photosOfInstallationLocation: string[];

  status: TServiceStatus;
  internalNote: string;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
