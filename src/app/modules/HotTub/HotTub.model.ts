import { model, Schema } from 'mongoose';
import {
  CONTACT_METHODS,
  DEFAULT_REQUEST_STATUS,
  OWNERSHIP_STATUSES,
  PROPERTY_TYPES,
  Service_STATUSES,
  TIMELINE_URGENCIES,
} from '../../constants';
import {
  HOT_TUB_AMPERAGES,
  HOT_TUB_LOCATIONS,
  HOT_TUB_PANEL_DISTANCE,
  HOT_TUB_PANEL_LOCATIONS,
  IHotTub,
} from './HotTub.interface';

const hotTubSchema = new Schema<IHotTub>(
  {
    serviceType: {
      type: String,
      trim: true,
      default: 'Hot tub installation',
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
    hasDigitalManual: {
      type: Boolean,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Please choose whether you have a digital manual!',
      ],
    },
    manualDocument: {
      type: String,
      trim: true,
    },
    hotTubManufacturer: {
      type: String,
      trim: true,
    },
    hotTubModelNumber: {
      type: String,
      trim: true,
    },
    amperageNeeded: {
      type: String,
      enum: HOT_TUB_AMPERAGES,
    },
    location: {
      type: String,
      enum: HOT_TUB_LOCATIONS,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Location is required!',
      ],
    },
    panelLocation: {
      type: String,
      enum: HOT_TUB_PANEL_LOCATIONS,
    },
    panelDistance: {
      type: String,
      enum: HOT_TUB_PANEL_DISTANCE,
    },
    panelPhotos: {
      type: [String],
      default: [],
    },
    hotTubPhotos: {
      type: [String],
      default: [],
    },
    receptaclePhotos: {
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

hotTubSchema.index({ createdBy: 1, status: 1 });

const HotTubModel = model<IHotTub>('HotTub', hotTubSchema);

export default HotTubModel;
