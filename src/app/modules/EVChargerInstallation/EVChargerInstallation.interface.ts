import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export interface IEVChargerInstallation extends Document {
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

  chargerConnectionType: string;
  nemaConfiguration?: string;
  chargerProvidedByUser?: boolean;
  chargerStatus?: string;

  installationLocation: string;
  panelLocation: string;
  panelDistance: string;

  environment?: string;
  budget?: string;
  accessibility?: string;
  schedule?: string;

  additionalInformation?: string;
  areaPhoto?: string;
  panelPhotos: string[];

  status: TServiceStatus;
  internalNote: string;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
