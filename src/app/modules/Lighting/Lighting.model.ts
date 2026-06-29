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
  ILighting,
  LIGHTING_INSTALL_TYPES,
  LIGHTING_SWITCH_CONNECTIONS,
} from './Lighting.interface';

const LightingSchema = new Schema<ILighting>(
  {
    serviceType: {
      type: String,
      trim: true,
      default: 'Lighting Installation',
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

    lightingType: {
      type: String,
      trim: true,
    },
    typeOfInteriorLightingFixture: {
      type: String,
      trim: true,
    },
    kindOfLightingFixture: {
      type: String,
      trim: true,
    },
    isFixtureHaveComplexAssembly: {
      type: Boolean,
    },
    isNewOrReplacement: {
      type: String,
      enum: LIGHTING_INSTALL_TYPES,
    },
    photosOfWhereWantToInstall: {
      type: [String],
      default: [],
    },
    photosOfCurrentLightFixture: {
      type: [String],
      default: [],
    },
    photosOfNewLightFixture: {
      type: [String],
      default: [],
    },
    photosOfInstallationAreaFloodLight: {
      type: [String],
      default: [],
    },
    photosOfCurrentFloodLight: {
      type: [String],
      default: [],
    },
    photosOfNewFloodLight: {
      type: [String],
      default: [],
    },
    tallOfCeiling: {
      type: String,
      trim: true,
    },
    heightOfFloodLightInstallation: {
      type: String,
      trim: true,
    },
    detailsOnTypeOfFixture: {
      type: String,
      trim: true,
    },
    willProvideNewLight: {
      type: Boolean,
    },
    typeOfSurfaceLightWillMountedTo: {
      type: String,
      trim: true,
    },
    fixtureConnectedToNewOrExistingSwitch: {
      type: String,
      enum: LIGHTING_SWITCH_CONNECTIONS,
    },
    kindOfSwitchWant: {
      type: String,
      trim: true,
    },
    wantToUpgradeSwitch: {
      type: Boolean,
    },
    moreThanOneSwitchLocation: {
      type: Boolean,
    },
    willProvideNewFloodLight: {
      type: Boolean,
    },
    floodLightControlledBy: {
      type: String,
      trim: true,
    },
    detailsOnTypeOfFloodLight: {
      type: String,
      trim: true,
    },
    detailsOnTypeOfNewWallLightWantToProvide: {
      type: String,
      trim: true,
    },
    detailsOnPoolAreaLightWantToProvide: {
      type: String,
      trim: true,
    },
    farFromHouseForDrivewayLighting: {
      type: String,
      trim: true,
    },
    howDrivewayLightWillControlled: {
      type: String,
      trim: true,
    },
    farFromHousePoolAreaLighting: {
      type: String,
      trim: true,
    },
    howPoolAreaLightWillControlled: {
      type: String,
      trim: true,
    },
    landscapeLightingDetails: {
      type: String,
      trim: true,
    },
    informationAboutLandscapeProject: {
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

LightingSchema.index({ createdBy: 1, status: 1 });
LightingSchema.index({ status: 1, createdAt: -1 });
LightingSchema.index({ createdBy: 1, createdAt: -1 });

LightingSchema.plugin(quoteSubmitNotificationPlugin);
LightingSchema.plugin(qIdPlugin);
LightingSchema.plugin(statusTimelinePlugin);

const LightingModel = model<ILighting>('Lighting', LightingSchema);

export default LightingModel;
