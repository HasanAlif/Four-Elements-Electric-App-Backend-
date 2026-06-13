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
  ACCESSORY_BUILDING_CIRCUIT_AMP_RATINGS,
  ACCESSORY_BUILDING_CIRCUIT_COUNTS,
  ACCESSORY_BUILDING_CONSTRUCTION_TYPES,
  ACCESSORY_BUILDING_FLOOR_TYPES,
  ACCESSORY_BUILDING_PANEL_LOCATIONS,
  ACCESSORY_BUILDING_SERVICE_SIZES,
  ACCESSORY_BUILDING_SERVICE_TYPES,
  ACCESSORY_BUILDING_STATUSES,
  IAccessoryBuildingPower,
} from './AccessoryBuildingPower.interface';

const accessoryBuildingPowerSchema = new Schema<IAccessoryBuildingPower>(
  {
    serviceType: {
      type: String,
      trim: true,
      default: 'Accessory Building / Shed Power',
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
    entireSquareFootage: {
      type: Number,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Entire square footage is required!',
      ],
      min: [1, 'Entire square footage must be greater than 0!'],
    },
    intendedUse: {
      type: String,
      trim: true,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Intended use is required!',
      ],
    },
    buildingStatus: {
      type: String,
      enum: ACCESSORY_BUILDING_STATUSES,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Building status is required!',
      ],
    },
    constructionType: {
      type: String,
      enum: ACCESSORY_BUILDING_CONSTRUCTION_TYPES,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Type of construction is required!',
      ],
    },
    hasHeatingOrCooling: {
      type: Boolean,
      required: [
        true,
        'Please choose whether there is any heating or cooling equipment!',
      ],
    },
    floorType: {
      type: String,
      enum: ACCESSORY_BUILDING_FLOOR_TYPES,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Type of floor is required!',
      ],
    },
    electricalServiceType: {
      type: String,
      enum: ACCESSORY_BUILDING_SERVICE_TYPES,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Electrical service type is required!',
      ],
    },
    serviceSize: {
      type: String,
      enum: ACCESSORY_BUILDING_SERVICE_SIZES,
    },
    serviceSizeOther: {
      type: String,
      trim: true,
    },
    dedicatedCircuitsCount: {
      type: String,
      enum: ACCESSORY_BUILDING_CIRCUIT_COUNTS,
    },
    dedicatedCircuitAmpRating: {
      type: String,
      enum: ACCESSORY_BUILDING_CIRCUIT_AMP_RATINGS,
    },
    panelLocation: {
      type: String,
      enum: ACCESSORY_BUILDING_PANEL_LOCATIONS,
      required: [
        function (this: any) {
          return this.status !== Service_STATUSES.DRAFT;
        },
        'Panel location is required!',
      ],
    },
    panelLocationOther: {
      type: String,
      trim: true,
    },
    panelPhotos: {
      type: [String],
      default: [],
    },
    routeDetails: {
      type: String,
      trim: true,
    },
    existingSpacePhotos: {
      type: [String],
      default: [],
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

accessoryBuildingPowerSchema.index({ createdBy: 1, status: 1 });

const AccessoryBuildingPowerModel = model<IAccessoryBuildingPower>(
  'AccessoryBuildingPower',
  accessoryBuildingPowerSchema,
);

export default AccessoryBuildingPowerModel;
