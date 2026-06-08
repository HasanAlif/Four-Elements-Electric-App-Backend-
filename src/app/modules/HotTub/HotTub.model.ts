import { model, Schema } from 'mongoose';
import { DEFAULT_REQUEST_STATUS, Service_STATUSES } from '../../constants';
import {
  HOT_TUB_AMPERAGES,
  HOT_TUB_CONTACT_METHODS,
  HOT_TUB_LOCATIONS,
  HOT_TUB_PANEL_DISTANCE,
  HOT_TUB_PANEL_LOCATIONS,
  HOT_TUB_PROPERTY_TYPES,
  HOT_TUB_TIMELINE_URGENCIES,
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
      enum: HOT_TUB_CONTACT_METHODS,
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
      enum: HOT_TUB_PROPERTY_TYPES,
      required: [true, 'Property type is required!'],
    },
    ownershipStatus: {
      type: String,
      enum: HOT_TUB_OWNERSHIP_STATUSES,
      required: [true, 'Ownership status is required!'],
    },
    timelineUrgency: {
      type: String,
      enum: HOT_TUB_TIMELINE_URGENCIES,
      required: [true, 'Timeline/urgency is required!'],
    },
    hasDigitalManual: {
      type: Boolean,
      required: [true, 'Please choose whether you have a digital manual!'],
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
      required: [true, 'Location is required!'],
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const HotTubModel = model<IHotTub>('HotTub', hotTubSchema);

export default HotTubModel;
