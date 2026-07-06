import { z } from 'zod';
import {
  CONTACT_METHODS,
  OWNERSHIP_STATUSES,
  PROPERTY_TYPES,
  TIMELINE_URGENCIES,
  Service_STATUSES,
} from '../../constants';
import { EXHAUST_FAN_INSTALL_TYPES } from './ExhaustFans.interface';

const exhaustFansBodySchema = z.object({
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

  newOrReplacement: z.enum(EXHAUST_FAN_INSTALL_TYPES).optional(),
  locationOfExhaustFan: z.string().optional(),
  isRoofOrGableFan: z.string().optional(),
  willSupplyAtticFan: z.boolean().optional(),
  photoOfNewFan: z.array(z.string()).optional(),
  howManyStories: z.number().optional(),
  photosOfInstallationArea: z.array(z.string()).optional(),
  whereElectricalPanelLocated: z.string().optional(),
  photosOfPanelCloseUp: z.array(z.string()).optional(),
  photosOfPanelWideShot: z.array(z.string()).optional(),
  photosOfCurrentKitchenExhaustFan: z.array(z.string()).optional(),
  photosOfCurrentBathroomExhaustFan: z.array(z.string()).optional(),
  existingDuctAndVentDiameterLocation: z.string().optional(),
  willProvideKitchenExhaustFan: z.boolean().optional(),
  willProvideBathroomExhaustFan: z.boolean().optional(),
  typeOfExhaustFanWanted: z.string().optional(),
  specialityControlsWanted: z.string().optional(),
  aboveBelowAreaOfExhaustFan: z.string().optional(),
  distanceOfElectricalPanelToExhaustFan: z.string().optional(),
  additionalInformation: z.string().optional(),

  status: z.enum(Service_STATUSES).optional(),
  completionPercentage: z.number().optional(),
});

export const ExhaustFansValidation = {
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
            ? exhaustFansBodySchema.partial().safeParse(data)
            : exhaustFansBodySchema.safeParse(data);
        if (!res.success) {
          res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
        }
      }),
  }),

  idParamsSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Exhaust fan request ID is required!' }).min(1),
    }),
  }),

  updateSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Exhaust fan request ID is required!' }).min(1),
    }),
    body: exhaustFansBodySchema
      .partial()
      .extend({ status: z.enum(Service_STATUSES).optional() }),
  }),
};
