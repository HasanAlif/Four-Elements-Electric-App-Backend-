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
  DOCK_POWER_CIRCUIT_AMP_RATINGS,
  DOCK_POWER_CIRCUIT_COUNTS,
  DOCK_POWER_NEW_SERVICE_SIZES,
  DOCK_POWER_SERVICE_TYPES,
  DOCK_POWER_SUB_PANEL_SIZES,
  IDockPower,
} from './DockPower.interface';

const dockPowerSchema = new Schema<IDockPower>(
  {
    serviceType: {
      type: String,
      trim: true,
      default: 'Dock Power',
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

    isDockBuilt: {
      type: Boolean,
    },
    electricalNeedsDetails: {
      type: String,
      trim: true,
    },
    receptacleCount: {
      type: Number,
    },

    electricalServiceType: {
      type: String,
      enum: DOCK_POWER_SERVICE_TYPES,
    },

    newServiceSize: {
      type: String,
      enum: DOCK_POWER_NEW_SERVICE_SIZES,
    },
    serviceSizeOther: {
      type: String,
      trim: true,
    },

    subPanelSize: {
      type: String,
      enum: DOCK_POWER_SUB_PANEL_SIZES,
    },

    dedicatedCircuitsCount: {
      type: String,
      enum: DOCK_POWER_CIRCUIT_COUNTS,
    },
    dedicatedCircuitAmpRating: {
      type: String,
      enum: DOCK_POWER_CIRCUIT_AMP_RATINGS,
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

    privateUtilitiesDetails: {
      type: String,
      trim: true,
    },
    routeDistanceDetails: {
      type: String,
      trim: true,
    },
    existingSpacePhotos: {
      type: [String],
      default: [],
    },

    hasPlansDrawings: {
      type: Boolean,
      default: false,
    },
    plansDrawingsPhotos: {
      type: [String],
      default: [],
    },

    permitApplied: {
      type: Boolean,
      default: false,
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

dockPowerSchema.index({ createdBy: 1, status: 1 });
dockPowerSchema.index({ status: 1, createdAt: -1 });
dockPowerSchema.index({ createdBy: 1, createdAt: -1 });

dockPowerSchema.plugin(quoteSubmitNotificationPlugin);
dockPowerSchema.plugin(qIdPlugin);
dockPowerSchema.plugin(statusTimelinePlugin);

const DockPowerModel = model<IDockPower>('DockPower', dockPowerSchema);

export default DockPowerModel;
