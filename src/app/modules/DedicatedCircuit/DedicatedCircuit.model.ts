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
import { statusTimelinePlugin } from '../../lib/statusTimeline';
import { IDedicatedCircuit } from './DedicatedCircuit.interface';

const DedicatedCircuitSchema = new Schema<IDedicatedCircuit>(
  {
    serviceType: {
      type: String,
      trim: true,
      default: 'Dedicated Circuit Installation',
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

    whyNeedDedicatedCircuit: {
      type: String,
      trim: true,
    },
    electricalPanelLocation: {
      type: String,
      trim: true,
    },
    whereWillDedicatedCircuitInstalled: {
      type: String,
      trim: true,
    },
    aboveBelowArea: {
      type: String,
      trim: true,
    },
    distanceElectricalPanelToInstallationArea: {
      type: String,
      trim: true,
    },
    ampsNeeded: {
      type: String,
      trim: true,
    },
    voltsNeeded: {
      type: String,
      trim: true,
    },
    NEMAConfiguration: {
      type: String,
      trim: true,
    },
    additionalInformation: {
      type: String,
      trim: true,
    },
    photosOfElectricalMeter: {
      type: [String],
      default: [],
    },
    photosOfInstallationLocation: {
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

DedicatedCircuitSchema.index({ createdBy: 1, status: 1 });
// admin/quotes fan-out (status != draft) + trend, and per-user lists — both sorted by createdAt
DedicatedCircuitSchema.index({ status: 1, createdAt: -1 });
DedicatedCircuitSchema.index({ createdBy: 1, createdAt: -1 });

DedicatedCircuitSchema.plugin(qIdPlugin);
DedicatedCircuitSchema.plugin(statusTimelinePlugin);

const DedicatedCircuitModel = model<IDedicatedCircuit>(
  'DedicatedCircuit',
  DedicatedCircuitSchema,
);

export default DedicatedCircuitModel;
