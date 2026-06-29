import { Document, Types } from 'mongoose';
import {
  TContactMethod,
  TOwnershipStatus,
  TPropertyType,
  TServiceStatus,
  TTimelineUrgency,
} from '../../constants';

export interface IAccessoryBuildingPower extends Document {
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

  entireSquareFootage: number;
  intendedUse: string;

  buildingStatus: string;
  constructionType: string;
  hasHeatingOrCooling: boolean;
  floorType: string;

  electricalServiceType: string;
  serviceSize?: string;
  serviceSizeOther?: string;
  dedicatedCircuitsCount?: string;
  dedicatedCircuitAmpRating?: string;

  panelLocation: string;
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
  internalNote: string;
  completionPercentage: number;

  createdAt: Date;
  updatedAt: Date;
}
