import { model, Schema } from 'mongoose';
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
import { IEVChargerInstallation } from './EVChargerInstallation.interface';
// import {
//   EV_CHARGER_CONNECTION_TYPES,
//   EV_CHARGER_DISTANCES,
//   EV_CHARGER_INSTALLATION_LOCATIONS,
//   EV_CHARGER_PANEL_LOCATIONS,
//   EV_CHARGER_STATUSES,
// } from './EVChargerInstallation.interface';

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
    chargerConnectionType: {
      type: String,
      trim: true,
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
      trim: true,
    },
    installationLocation: {
      type: String,
      trim: true,
    },
    panelLocation: {
      type: String,
      trim: true,
    },
    panelDistance: {
      type: String,
      trim: true,
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

evChargerInstallationSchema.index({ createdBy: 1, status: 1 });
// admin/quotes fan-out (status != draft) + trend, and per-user lists — both sorted by createdAt
evChargerInstallationSchema.index({ status: 1, createdAt: -1 });
evChargerInstallationSchema.index({ createdBy: 1, createdAt: -1 });

evChargerInstallationSchema.plugin(quoteSubmitNotificationPlugin);
evChargerInstallationSchema.plugin(qIdPlugin);
evChargerInstallationSchema.plugin(statusTimelinePlugin);

const EVChargerInstallationModel = model<IEVChargerInstallation>(
  'EVChargerInstallation',
  evChargerInstallationSchema,
);

export default EVChargerInstallationModel;
