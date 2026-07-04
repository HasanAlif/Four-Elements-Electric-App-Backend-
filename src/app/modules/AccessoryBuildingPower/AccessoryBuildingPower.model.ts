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
import { IAccessoryBuildingPower } from './AccessoryBuildingPower.interface';

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
      trim: true,
    },
    intendedUse: {
      type: String,
      trim: true,
    },
    electricalNeeds: {
      type: String,
      trim: true,
    },
    willThereBeAnyHeatingOrCoolingEquipment: {
      type: Boolean,
    },
    willNeedNewService: {
      type: String,
      trim: true,
    },
    sizeOfSubPanel: {
      type: String,
      trim: true,
    },
    electricalPannelLocation: {
      type: String,
      trim: true,
    },
    photosOfElectricalPannel: {
      type: [String],
      default: [],
    },
    howManyDedicatedCircuitsNeed: {
      type: String,
      trim: true,
    },
    ampRatingForDedicatedCircuit: {
      type: String,
      trim: true,
    },
    privateUtilitiesBetweenHouseAndAccessoryBuilding: {
      type: String,
      trim: true,
    },
    generalIdeaOfPrivateUtilitiesBetweenHouseAndAccessoryBuilding: {
      type: String,
      trim: true,
    },
    existingSpacePhotos: {
      type: [String],
      default: [],
    },
    photosOfPlansDrawings: {
      type: [String],
      default: [],
    },
    buildingStatus: {
      type: String,
      trim: true,
    },
    constructionType: {
      type: String,
      trim: true,
    },
    hasHeatingOrCooling: {
      type: Boolean,
    },
    floorType: {
      type: String,
      trim: true,
    },
    electricalServiceType: {
      type: String,
      trim: true,
    },
    serviceSize: {
      type: String,
      trim: true,
    },
    serviceSizeOther: {
      type: String,
      trim: true,
    },
    dedicatedCircuitsCount: {
      type: String,
      trim: true,
    },
    dedicatedCircuitAmpRating: {
      type: String,
      trim: true,
    },
    panelLocation: {
      type: String,
      trim: true,
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
    hasPlansDrawings: {
      type: Boolean,
    },
    permitApplied: {
      type: Boolean,
    },
    permitNumber: {
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

accessoryBuildingPowerSchema.index({ createdBy: 1, status: 1 });
accessoryBuildingPowerSchema.index({ status: 1, createdAt: -1 });
accessoryBuildingPowerSchema.index({ createdBy: 1, createdAt: -1 });

accessoryBuildingPowerSchema.plugin(quoteSubmitNotificationPlugin);
accessoryBuildingPowerSchema.plugin(qIdPlugin);
accessoryBuildingPowerSchema.plugin(statusTimelinePlugin);

const AccessoryBuildingPowerModel = model<IAccessoryBuildingPower>(
  'AccessoryBuildingPower',
  accessoryBuildingPowerSchema,
);

export default AccessoryBuildingPowerModel;
