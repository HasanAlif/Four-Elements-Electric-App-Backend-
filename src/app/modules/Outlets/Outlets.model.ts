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
import { IOutlets, OUTLET_INSTALL_TYPES } from './Outlets.interface';

const OutletsSchema = new Schema<IOutlets>(
  {
    serviceType: {
      type: String,
      trim: true,
      default: 'Outlet Installation',
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

    intendedUseOfOutlets: {
      type: String,
      trim: true,
    },
    howManyOutletsNeeds: {
      type: String,
      trim: true,
    },
    newInstallationOrReplacement: {
      type: String,
      enum: OUTLET_INSTALL_TYPES,
    },
    photosOfWhereOutletsInstall: {
      type: [String],
      default: [],
    },
    typeOfOutletsNeed: {
      type: String,
      trim: true,
    },
    photosOfCurrentOutlets: {
      type: [String],
      default: [],
    },
    howManyAmps: {
      type: String,
      trim: true,
    },
    ampsOrVoltsNeeded: {
      type: String,
      trim: true,
    },
    NEMAConfiguration: {
      type: String,
      trim: true,
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

OutletsSchema.index({ createdBy: 1, status: 1 });
OutletsSchema.index({ status: 1, createdAt: -1 });
OutletsSchema.index({ createdBy: 1, createdAt: -1 });

OutletsSchema.plugin(quoteSubmitNotificationPlugin);
OutletsSchema.plugin(qIdPlugin);
OutletsSchema.plugin(statusTimelinePlugin);

const OutletsModel = model<IOutlets>('Outlets', OutletsSchema);

export default OutletsModel;
