import { model, Schema } from 'mongoose';
import { CONTACT_METHODS, DEFAULT_REQUEST_STATUS, OWNERSHIP_STATUSES, PROPERTY_TYPES, Service_STATUSES, TIMELINE_URGENCIES } from '../../constants';
import {
  IRemodeling,
  REMODELING_PANEL_LOCATIONS,
} from './Remodeling.interface';

const remodelingSchema = new Schema<IRemodeling>(
  {
    serviceType: {
      type: String,
      trim: true,
      default: 'Remodeling',
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
    panelLocation: {
      type: String,
      enum: REMODELING_PANEL_LOCATIONS,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Panel location is required!',
      ],
    },
    remodelingAreas: {
      type: String,
      trim: true,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Remodeling area is required!',
      ],
    },
    hasPlansDrawings: {
      type: Boolean,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Please choose whether you have plans/drawings!',
      ],
    },
    plansDrawings: {
      type: [String],
      default: [],
    },
    electricalNeeds: {
      type: String,
      trim: true,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Electrical needs are required!',
      ],
    },
    permitApplied: {
      type: Boolean,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Please choose whether a permit has been applied for!',
      ],
    },
    permitNumber: {
      type: String,
      trim: true,
    },
    additionalInformation: {
      type: String,
      trim: true,
    },
    existingSpacePhotos: {
      type: [String],
      default: [],
    },
    panelPhotos: {
      type: [String],
      default: [],
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

remodelingSchema.index({ createdBy: 1, status: 1 });

const RemodelingModel = model<IRemodeling>('Remodeling', remodelingSchema);

export default RemodelingModel;
