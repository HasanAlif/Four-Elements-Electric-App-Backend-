/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  CEILING_FAN_INSTALL_TYPES,
  ICellingFans,
} from './CellingFans.interface';

const CellingFansSchema = new Schema<ICellingFans>(
  {
    serviceType: {
      type: String,
      trim: true,
      default: 'Ceiling Fan Installation',
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

    installationType: {
      type: String,
      enum: CEILING_FAN_INSTALL_TYPES,
    },
    photosOfCurrentCeilingFan: {
      type: [String],
      default: [],
    },
    aboveBelowAreaOfCeilingFan: {
      type: String,
      trim: true,
    },
    isThereCurrentLightFixture: {
      type: Boolean,
    },
    wasAreaPrewired: {
      type: String,
      trim: true,
    },
    willProvideNewCeilingFan: {
      type: Boolean,
    },
    describeFanWantInstalled: {
      type: String,
      trim: true,
    },
    tallOfCeilingFanFromFloor: {
      type: String,
      trim: true,
    },
    photosOfNewCeilingFan: {
      type: [String],
      default: [],
    },
    willConnectNewOrExistingSwitch: {
      type: String,
      trim: true,
    },
    wantUpgradeSwitch: {
      type: Boolean,
    },
    kindOfSwitchWant: {
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

CellingFansSchema.index({ createdBy: 1, status: 1 });
CellingFansSchema.index({ status: 1, createdAt: -1 });
CellingFansSchema.index({ createdBy: 1, createdAt: -1 });

CellingFansSchema.plugin(quoteSubmitNotificationPlugin);
CellingFansSchema.plugin(qIdPlugin);
CellingFansSchema.plugin(statusTimelinePlugin);

const CellingFansModel = model<ICellingFans>('CellingFans', CellingFansSchema);

export default CellingFansModel;
