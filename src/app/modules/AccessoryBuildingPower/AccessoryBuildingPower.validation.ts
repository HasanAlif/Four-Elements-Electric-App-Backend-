import { z } from 'zod';
import {
  CONTACT_METHODS,
  OWNERSHIP_STATUSES,
  PROPERTY_TYPES,
  TIMELINE_URGENCIES,
  Service_STATUSES,
} from '../../constants';
import {
  ACCESSORY_BUILDING_CIRCUIT_AMP_RATINGS,
  ACCESSORY_BUILDING_CIRCUIT_COUNTS,
  ACCESSORY_BUILDING_CONSTRUCTION_TYPES,
  ACCESSORY_BUILDING_FLOOR_TYPES,
  ACCESSORY_BUILDING_SERVICE_SIZES,
  ACCESSORY_BUILDING_SERVICE_TYPES,
} from './AccessoryBuildingPower.interface';

const accessoryBuildingPowerBodySchema = z.object({
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

  entireSquareFootage: z.coerce
    .number()
    .min(1, 'Entire square footage must be greater than 0!')
    .optional(),
  intendedUse: z.string().optional(),

  buildingStatus: z.string().optional(),
  constructionType: z.enum(ACCESSORY_BUILDING_CONSTRUCTION_TYPES).optional(),
  hasHeatingOrCooling: z.boolean().optional(),
  floorType: z.enum(ACCESSORY_BUILDING_FLOOR_TYPES).optional(),

  electricalServiceType: z.enum(ACCESSORY_BUILDING_SERVICE_TYPES).optional(),
  serviceSize: z.enum(ACCESSORY_BUILDING_SERVICE_SIZES).optional(),
  serviceSizeOther: z.string().optional(),
  dedicatedCircuitsCount: z.enum(ACCESSORY_BUILDING_CIRCUIT_COUNTS).optional(),
  dedicatedCircuitAmpRating: z
    .enum(ACCESSORY_BUILDING_CIRCUIT_AMP_RATINGS)
    .optional(),

  panelLocation: z.string().optional(),
  panelLocationOther: z.string().optional(),

  panelPhotos: z.array(z.string()).optional(),
  routeDetails: z.string().optional(),
  existingSpacePhotos: z.array(z.string()).optional(),

  hasPlansDrawings: z.boolean().optional(),
  plansDrawings: z.array(z.string()).optional(),
  permitApplied: z.boolean().optional(),
  permitNumber: z.string().optional(),
  additionalInformation: z.string().optional(),
  status: z.enum(Service_STATUSES).optional(),
  completionPercentage: z.number().optional(),
});

export const AccessoryBuildingPowerValidation = {
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
            ? accessoryBuildingPowerBodySchema.partial().safeParse(data)
            : accessoryBuildingPowerBodySchema.safeParse(data);
        if (!res.success) {
          res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
        }
      }),
  }),

  idParamsSchema: z.object({
    params: z.object({
      id: z
        .string({
          error: 'Accessory building power request ID is required!',
        })
        .min(1),
    }),
  }),

  updateSchema: z.object({
    params: z.object({
      id: z
        .string({
          error: 'Accessory building power request ID is required!',
        })
        .min(1),
    }),
    body: accessoryBuildingPowerBodySchema
      .partial()
      .extend({ status: z.enum(Service_STATUSES).optional() }),
  }),
};
