import { model, Schema } from 'mongoose';
import { IServiceCall } from './ServiceCall.interface';
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

const serviceCallSchema = new Schema<IServiceCall>(
  {
    serviceType: {
      type: String,
      trim: true,
      default: 'Service Call',
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

    issueDescription: {
      type: String,
      trim: true,
    },
    preferredTime: {
      type: [String],
      default: [],
    },
    schedulingPreference: {
      type: [String],
      default: [],
    },
    panelPhotos: {
      type: [String],
      default: [],
    },
    workAreaPhotos: {
      type: [String],
      default: [],
    },
    extraReferencePhotos: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    quickTags: {
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

serviceCallSchema.index({ createdBy: 1, status: 1 });
serviceCallSchema.index({ status: 1, createdAt: -1 });
serviceCallSchema.index({ createdBy: 1, createdAt: -1 });

serviceCallSchema.plugin(quoteSubmitNotificationPlugin);
serviceCallSchema.plugin(qIdPlugin);
serviceCallSchema.plugin(statusTimelinePlugin);

const ServiceCallModel = model<IServiceCall>('ServiceCall', serviceCallSchema);

export default ServiceCallModel;
