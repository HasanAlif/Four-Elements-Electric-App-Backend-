import { model, Schema } from 'mongoose';
import { IEVChargerInstallation } from './EVChargerInstallation.interface';

const evChargerInstallationSchema = new Schema<IEVChargerInstallation>(
  {
    serviceType: {
      type: String,
      trim: true,
      default: 'EV Charger Installation',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
      required: [true, 'Full name is required!'],
    },
    phoneNumber: {
      type: String,
      trim: true,
      required: [true, 'Phone number is required!'],
    },
    emailAddress: {
      type: String,
      trim: true,
      lowercase: true,
    },
    preferredContactMethod: {
      type: String,
      enum: ['Call', 'Text', 'Email'],
      default: 'Call',
    },
    streetAddress: {
      type: String,
      trim: true,
      required: [true, 'Street address is required!'],
    },
    apartmentUnit: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      required: [true, 'City is required!'],
    },
    state: {
      type: String,
      trim: true,
      required: [true, 'State is required!'],
    },
    zipCode: {
      type: String,
      trim: true,
      required: [true, 'ZIP code is required!'],
    },
    propertyType: {
      type: String,
      enum: ['House', 'Condo', 'Apartment', 'Commercial'],
      required: [true, 'Property type is required!'],
    },
    ownershipStatus: {
      type: String,
      enum: ['Owner', 'Tenant', 'Property Manager', 'Other'],
      required: [true, 'Ownership status is required!'],
    },
    timelineUrgency: {
      type: String,
      enum: ['As soon as possible', 'This week', 'This month', 'Flexible'],
      required: [true, 'Timeline/urgency is required!'],
    },
    chargerConnectionType: {
      type: String,
      enum: ['Plug-in', 'Hardwired', 'I want help deciding'],
      required: [true, 'Charger connection type is required!'],
    },
    nemaConfiguration: {
      type: String,
      trim: true,
    },
    chargerProvidedByUser: {
      type: Boolean,
    },
    chargerStatus: {
      type: String,
      enum: [
        'Currently have the charger',
        'Ordered and waiting on delivery',
        'Need to place order',
        'Need help choosing a charger',
      ],
    },
    installationLocation: {
      type: String,
      enum: ['Garage', 'Carport', 'Driveway', 'Other'],
      required: [true, 'Installation location is required!'],
    },
    panelLocation: {
      type: String,
      enum: [
        'Basement (Finished)',
        'Basement (Unfinished)',
        'Garage (Finished)',
        'Garage (Unfinished)',
        'Other (please specify)',
      ],
      required: [true, 'Panel location is required!'],
    },
    panelDistance: {
      type: String,
      enum: [
        'Less than 25 ft',
        '25-50 ft',
        '50-100 ft',
        'More than 100 ft',
        'Unsure',
      ],
      required: [true, 'Distance is required!'],
    },
    environment: {
      type: String,
      trim: true,
    },
    budget: {
      type: String,
      trim: true,
    },
    accessibility: {
      type: String,
      trim: true,
    },
    schedule: {
      type: String,
      trim: true,
    },
    additionalInformation: {
      type: String,
      trim: true,
    },
    areaPhoto: {
      type: String,
    },
    panelPhotos: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'in_review',
        'quoted',
        'scheduled',
        'completed',
        'cancelled',
      ],
      default: 'submitted',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const EVChargerInstallationModel = model<IEVChargerInstallation>(
  'EVChargerInstallation',
  evChargerInstallationSchema,
);

export default EVChargerInstallationModel;
