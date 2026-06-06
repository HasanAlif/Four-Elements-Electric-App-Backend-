import { model, Schema } from 'mongoose';
import { DEFAULT_REQUEST_STATUS, Service_STATUSES } from '../../constants';
import {
  ACCESSORY_BUILDING_CIRCUIT_AMP_RATINGS,
  ACCESSORY_BUILDING_CIRCUIT_COUNTS,
  ACCESSORY_BUILDING_CONSTRUCTION_TYPES,
  ACCESSORY_BUILDING_CONTACT_METHODS,
  ACCESSORY_BUILDING_FLOOR_TYPES,
  ACCESSORY_BUILDING_OWNERSHIP_STATUSES,
  ACCESSORY_BUILDING_PANEL_LOCATIONS,
  ACCESSORY_BUILDING_PROPERTY_TYPES,
  ACCESSORY_BUILDING_SERVICE_SIZES,
  ACCESSORY_BUILDING_SERVICE_TYPES,
  ACCESSORY_BUILDING_STATUSES,
  ACCESSORY_BUILDING_TIMELINE_URGENCIES,
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
      enum: ACCESSORY_BUILDING_CONTACT_METHODS,
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
      enum: ACCESSORY_BUILDING_PROPERTY_TYPES,
      required: [true, 'Property type is required!'],
    },
    ownershipStatus: {
      type: String,
      enum: ACCESSORY_BUILDING_OWNERSHIP_STATUSES,
      required: [true, 'Ownership status is required!'],
    },
    timelineUrgency: {
      type: String,
      enum: ACCESSORY_BUILDING_TIMELINE_URGENCIES,
      required: [true, 'Timeline/urgency is required!'],
    },
    entireSquareFootage: {
      type: Number,
      required: [true, 'Entire square footage is required!'],
      min: [1, 'Entire square footage must be greater than 0!'],
    },
    intendedUse: {
      type: String,
      trim: true,
      required: [true, 'Intended use is required!'],
    },
    buildingStatus: {
      type: String,
      enum: ACCESSORY_BUILDING_STATUSES,
      required: [true, 'Building status is required!'],
    },
    constructionType: {
      type: String,
      enum: ACCESSORY_BUILDING_CONSTRUCTION_TYPES,
      required: [true, 'Type of construction is required!'],
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
      required: [true, 'Type of floor is required!'],
    },
    electricalServiceType: {
      type: String,
      enum: ACCESSORY_BUILDING_SERVICE_TYPES,
      required: [true, 'Electrical service type is required!'],
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
      required: [true, 'Panel location is required!'],
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
      required: [true, 'Please choose whether you have plans/drawings!'],
    },
    plansDrawings: {
      type: [String],
      default: [],
    },
    permitApplied: {
      type: Boolean,
      required: [true, 'Please choose whether a permit has been applied for!'],
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const AccessoryBuildingPowerModel = model<IAccessoryBuildingPower>(
  'AccessoryBuildingPower',
  accessoryBuildingPowerSchema,
);

export default AccessoryBuildingPowerModel;
