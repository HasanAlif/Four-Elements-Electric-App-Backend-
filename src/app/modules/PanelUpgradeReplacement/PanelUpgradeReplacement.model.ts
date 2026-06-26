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
import { qIdPlugin } from '../../lib/qId';
import { quoteSubmitNotificationPlugin } from '../Notification/Notification.plugin';
import { statusTimelinePlugin } from '../../lib/statusTimeline';

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
    },
    desiredPanelAmperage: {
      type: String,
      enum: PANEL_AMPERAGES,
    },
    currentPanelAmperage: {
      type: String,
      enum: PANEL_AMPERAGES,
    },
    panelLocation: {
      type: String,
      enum: PANEL_LOCATIONS,
    },
    powerFeedType: {
      type: String,
      enum: PANEL_POWER_FEEDS,
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

    internalNote: {
      type: String,
      trim: true,
      default: '',
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
// admin/quotes fan-out (status != draft) + trend, and per-user lists — both sorted by createdAt
panelUpgradeReplacementSchema.index({ status: 1, createdAt: -1 });
panelUpgradeReplacementSchema.index({ createdBy: 1, createdAt: -1 });

panelUpgradeReplacementSchema.plugin(quoteSubmitNotificationPlugin);
panelUpgradeReplacementSchema.plugin(qIdPlugin);
panelUpgradeReplacementSchema.plugin(statusTimelinePlugin);

const PanelUpgradeReplacementModel = model<IPanelUpgradeReplacement>(
  'PanelUpgradeReplacement',
  panelUpgradeReplacementSchema,
);

export default PanelUpgradeReplacementModel;
