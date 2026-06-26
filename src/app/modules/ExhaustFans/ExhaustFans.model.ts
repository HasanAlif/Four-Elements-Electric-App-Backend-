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
  EXHAUST_FAN_INSTALL_TYPES,
  IExhaustFans,
} from './ExhaustFans.interface';

const ExhaustFansSchema = new Schema<IExhaustFans>(
  {
    serviceType: {
      type: String,
      trim: true,
      default: 'Exhaust Fan Installation',
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

    newOrReplacement: {
      type: String,
      enum: EXHAUST_FAN_INSTALL_TYPES,
    },
    locationOfExhaustFan: {
      type: String,
      trim: true,
    },
    isRoofOrGableFan: {
      type: String,
      trim: true,
    },
    willSupplyAtticFan: {
      type: Boolean,
      default: false,
    },
    photoOfNewFan: {
      type: [String],
      default: [],
    },
    howManyStories: {
      type: Number,
      min: 1,
    },
    photosOfInstallationArea: {
      type: [String],
      default: [],
    },
    whereElectricalPanelLocated: {
      type: String,
      trim: true,
    },
    photosOfPanelCloseUp: {
      type: [String],
      default: [],
    },
    photosOfPanelWideShot: {
      type: [String],
      default: [],
    },
    photosOfCurrentKitchenExhaustFan: {
      type: [String],
      default: [],
    },
    photosOfCurrentBathroomExhaustFan: {
      type: [String],
      default: [],
    },
    existingDuctAndVentDiameterLocation: {
      type: String,
      trim: true,
    },
    willProvideKitchenExhaustFan: {
      type: Boolean,
    },
    willProvideBathroomExhaustFan: {
      type: Boolean,
    },
    typeOfExhaustFanWanted: {
      type: String,
      trim: true,
    },
    specialityControlsWanted: {
      type: String,
      trim: true,
    },
    aboveBelowAreaOfExhaustFan: {
      type: String,
      trim: true,
    },
    distanceOfElectricalPanelToExhaustFan: {
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

ExhaustFansSchema.index({ createdBy: 1, status: 1 });
// admin/quotes fan-out (status != draft) + trend, and per-user lists — both sorted by createdAt
ExhaustFansSchema.index({ status: 1, createdAt: -1 });
ExhaustFansSchema.index({ createdBy: 1, createdAt: -1 });

ExhaustFansSchema.plugin(quoteSubmitNotificationPlugin);
ExhaustFansSchema.plugin(qIdPlugin);
ExhaustFansSchema.plugin(statusTimelinePlugin);

const ExhaustFansModel = model<IExhaustFans>('ExhaustFans', ExhaustFansSchema);

export default ExhaustFansModel;
