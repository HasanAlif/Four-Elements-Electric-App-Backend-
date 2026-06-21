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
import { IGenarator } from './Genarator.interface';

const GenaratorSchema = new Schema<IGenarator>(
  {
    serviceType: {
      type: String,
      trim: true,
      default: 'Generator Installation',
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

    generatorType: {
      type: String,
      trim: true,
    },
    isAlreadyHaveGenerator: {
      type: Boolean,
    },
    generatorOutputPower: {
      type: String,
      trim: true,
    },
    preferredBackupInstallation: {
      type: String,
      trim: true,
    },
    generatorDistanceFromInletLocation: {
      type: String,
      trim: true,
    },
    electricPanelLocation: {
      type: String,
      trim: true,
    },
    photosOfWhereGeneratorWillBeInlet: {
      type: [String],
      default: [],
    },
    photosOfReceptacleOnGenerator: {
      type: [String],
      default: [],
    },
    electricPanelPhotos: {
      type: [String],
      default: [],
    },
    generatorInstallationLocationPhotos: {
      type: [String],
      default: [],
    },
    sizeOfGeneratorWanted: {
      type: String,
      trim: true,
    },
    backupNeeds: {
      type: String,
      trim: true,
    },
    isHavePropane: {
      type: Boolean,
    },
    photosOfElectricalMeter: {
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

GenaratorSchema.index({ createdBy: 1, status: 1 });

GenaratorSchema.plugin(qIdPlugin);

const GenaratorModel = model<IGenarator>('Genarator', GenaratorSchema);

export default GenaratorModel;
