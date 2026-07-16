import { z } from 'zod';
import {
  CONTACT_METHODS,
  OWNERSHIP_STATUSES,
  PROPERTY_TYPES,
  TIMELINE_URGENCIES,
  Service_STATUSES,
} from '../../constants';
import { LIGHTING_SWITCH_CONNECTIONS } from './Lighting.interface';

const lightingBodySchema = z.object({
  fullName: z.string({ error: 'Full name is required!' }).min(1),
  phoneNumber: z.string({ error: 'Phone number is required!' }).min(1),
  emailAddress: z.string().email('Invalid email format!').optional(),
  preferredContactMethod: z.enum(CONTACT_METHODS).optional(),

  streetAddress: z.string({ error: 'Street address is required!' }).min(1),
  apartmentUnit: z.string().optional(),
  city: z.string({ error: 'City is required!' }).min(1),
  state: z.string({ error: 'State is required!' }).min(1),
  zipCode: z.string({ error: 'ZIP code is required!' }).min(1),

  propertyType: z.enum(PROPERTY_TYPES),
  ownershipStatus: z.enum(OWNERSHIP_STATUSES),
  timelineUrgency: z.enum(TIMELINE_URGENCIES),

  lightingType: z.string().optional(),
  typeOfInteriorLightingFixture: z.string().optional(),
  kindOfLightingFixture: z.string().optional(),
  isFixtureHaveComplexAssembly: z.boolean().optional(),
  isNewOrReplacement: z.string().optional(),
  photosOfWhereWantToInstall: z.array(z.string()).optional(),
  photosOfCurrentLightFixture: z.array(z.string()).optional(),
  photosOfNewLightFixture: z.array(z.string()).optional(),
  photosOfInstallationAreaFloodLight: z.array(z.string()).optional(),
  photosOfCurrentFloodLight: z.array(z.string()).optional(),
  photosOfNewFloodLight: z.array(z.string()).optional(),
  tallOfCeiling: z.string().optional(),
  heightOfFloodLightInstallation: z.string().optional(),
  detailsOnTypeOfFixture: z.string().optional(),
  willProvideNewLight: z.boolean().optional(),
  typeOfSurfaceLightWillMountedTo: z.string().optional(),
  fixtureConnectedToNewOrExistingSwitch: z
    .enum(LIGHTING_SWITCH_CONNECTIONS)
    .optional(),
  kindOfSwitchWant: z.string().optional(),
  wantToUpgradeSwitch: z.boolean().optional(),
  moreThanOneSwitchLocation: z.boolean().optional(),
  willProvideNewFloodLight: z.boolean().optional(),
  floodLightControlledBy: z.string().optional(),
  detailsOnTypeOfFloodLight: z.string().optional(),
  detailsOnTypeOfNewWallLightWantToProvide: z.string().optional(),
  detailsOnPoolAreaLightWantToProvide: z.string().optional(),
  farFromHouseForDrivewayLighting: z.string().optional(),
  howDrivewayLightWillControlled: z.string().optional(),
  farFromHousePoolAreaLighting: z.string().optional(),
  howPoolAreaLightWillControlled: z.string().optional(),
  landscapeLightingDetails: z.string().optional(),
  informationAboutLandscapeProject: z.string().optional(),
  additionalInformation: z.string().optional(),

  status: z.enum(Service_STATUSES).optional(),
  completionPercentage: z.number().optional(),
});

export const LightingValidation = {
  createSchema: z.object({
    body: z
      .any()
      .transform(data => {
        if (typeof data !== 'object' || data === null) return data;
        const cleanData = { ...data };
        for (const key in cleanData) {
          if (cleanData[key] === '' || cleanData[key] === null) {
            delete cleanData[key];
          } else if (Array.isArray(cleanData[key])) {
            cleanData[key] = cleanData[key].filter(
              (v: any) => v !== '' && v !== null,
            );
            if (cleanData[key].length === 0) delete cleanData[key];
          }
        }
        return cleanData;
      })
      .superRefine((data, ctx) => {
        const res =
          data.status === Service_STATUSES.DRAFT
            ? lightingBodySchema.partial().safeParse(data)
            : lightingBodySchema.safeParse(data);
        if (!res.success) {
          res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
        }
      }),
  }),

  idParamsSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Lighting request ID is required!' }).min(1),
    }),
  }),

  updateSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Lighting request ID is required!' }).min(1),
    }),
    body: lightingBodySchema
      .partial()
      .extend({ status: z.enum(Service_STATUSES).optional() }),
  }),
};
