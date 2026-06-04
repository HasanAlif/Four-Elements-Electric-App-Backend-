import { Document, Types } from 'mongoose';

export type TEVChargerConnectionType =
  | 'Plug-in'
  | 'Hardwired'
  | 'I want help deciding';
export type TEVChargerStatus =
  | 'Currently have the charger'
  | 'Ordered and waiting on delivery'
  | 'Need to place order'
  | 'Need help choosing a charger';
export type TEVChargerInstallationLocation =
  | 'Garage'
  | 'Carport'
  | 'Driveway'
  | 'Other';
export type TEVChargerPanelLocation =
  | 'Basement (Finished)'
  | 'Basement (Unfinished)'
  | 'Garage (Finished)'
  | 'Garage (Unfinished)'
  | 'Other (please specify)';
export type TEVChargerDistance =
  | 'Less than 25 ft'
  | '25-50 ft'
  | '50-100 ft'
  | 'More than 100 ft'
  | 'Unsure';
export type TEVChargerPropertyType =
  | 'House'
  | 'Condo'
  | 'Apartment'
  | 'Commercial';
export type TEVChargerOwnershipStatus =
  | 'Owner'
  | 'Tenant'
  | 'Property Manager'
  | 'Other';
export type TEVChargerTimelineUrgency =
  | 'As soon as possible'
  | 'This week'
  | 'This month'
  | 'Flexible';

export interface IEVChargerInstallation extends Document {
  _id: Types.ObjectId;

  serviceType: string;
  createdBy: Types.ObjectId;

  fullName: string;
  phoneNumber: string;
  emailAddress?: string;
  preferredContactMethod: 'Call' | 'Text' | 'Email';

  streetAddress: string;
  apartmentUnit?: string;
  city: string;
  state: string;
  zipCode: string;

  propertyType: TEVChargerPropertyType;
  ownershipStatus: TEVChargerOwnershipStatus;
  timelineUrgency: TEVChargerTimelineUrgency;

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

  notes?: string;
  status:
    | 'draft'
    | 'submitted'
    | 'in_review'
    | 'quoted'
    | 'scheduled'
    | 'completed'
    | 'cancelled';

  createdAt: Date;
  updatedAt: Date;
}
