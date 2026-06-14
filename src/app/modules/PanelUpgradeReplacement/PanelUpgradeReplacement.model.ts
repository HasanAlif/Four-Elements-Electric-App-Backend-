import { model, Schema } from 'mongoose';
import {
  IPanelUpgradeReplacement,
  PANEL_AMPERAGES,
  PANEL_LOCATIONS,
  PANEL_POWER_FEEDS,
  PANEL_SERVICE_TYPES,
} from './PanelUpgradeReplacement.interface';
import {
  CONTACT_METHODS,
  DEFAULT_REQUEST_STATUS,
  OWNERSHIP_STATUSES,
  PROPERTY_TYPES,
  Service_STATUSES,
  TIMELINE_URGENCIES,
} from '../../constants';

const panelUpgradeReplacementSchema = new Schema<IPanelUpgradeReplacement>(
  {
    serviceType: {
      type: String,
      trim: true,
      default: 'Panel Upgrade / Replacement',
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
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Full name is required!',
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Phone number is required!',
      ],
    },
    emailAddress: {
      type: String,
      trim: true,
      lowercase: true,
    },
    preferredContactMethod: {
      type: String,
      enum: CONTACT_METHODS,
      default: 'Call',
    },
    streetAddress: {
      type: String,
      trim: true,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Street address is required!',
      ],
    },
    apartmentUnit: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'City is required!',
      ],
    },
    state: {
      type: String,
      trim: true,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'State is required!',
      ],
    },
    zipCode: {
      type: String,
      trim: true,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'ZIP code is required!',
      ],
    },
    propertyType: {
      type: String,
      enum: PROPERTY_TYPES,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Property type is required!',
      ],
    },
    ownershipStatus: {
      type: String,
      enum: OWNERSHIP_STATUSES,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Ownership status is required!',
      ],
    },
    timelineUrgency: {
      type: String,
      enum: TIMELINE_URGENCIES,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Timeline/urgency is required!',
      ],
    },
    panelServiceType: {
      type: String,
      enum: PANEL_SERVICE_TYPES,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Service type is required!',
      ],
    },
    desiredPanelAmperage: {
      type: String,
      enum: PANEL_AMPERAGES,
    },
    currentPanelAmperage: {
      type: String,
      enum: PANEL_AMPERAGES,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Current panel amperage is required!',
      ],
    },
    panelLocation: {
      type: String,
      enum: PANEL_LOCATIONS,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Panel location is required!',
      ],
    },
    powerFeedType: {
      type: String,
      enum: PANEL_POWER_FEEDS,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Power feed type is required!',
      ],
    },
    meterPhotos: {
      type: [String],
      default: [],
    },
    panelPhotos: {
      type: [String],
      default: [],
    },
    additionalInformation: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: Service_STATUSES,
      default: DEFAULT_REQUEST_STATUS,
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

panelUpgradeReplacementSchema.index({ createdBy: 1, status: 1 });

const PanelUpgradeReplacementModel = model<IPanelUpgradeReplacement>(
  'PanelUpgradeReplacement',
  panelUpgradeReplacementSchema,
);

export default PanelUpgradeReplacementModel;
