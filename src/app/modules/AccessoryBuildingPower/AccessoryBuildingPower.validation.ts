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
  ACCESSORY_BUILDING_PANEL_LOCATIONS,
  ACCESSORY_BUILDING_SERVICE_SIZES,
  ACCESSORY_BUILDING_SERVICE_TYPES,
  ACCESSORY_BUILDING_STATUSES,
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
    .number({ error: 'Entire square footage is required!' })
    .min(1, 'Entire square footage must be greater than 0!'),
  intendedUse: z.string({ error: 'Intended use is required!' }).min(1),

  buildingStatus: z.enum(ACCESSORY_BUILDING_STATUSES),
  constructionType: z.enum(ACCESSORY_BUILDING_CONSTRUCTION_TYPES),
  hasHeatingOrCooling: z.boolean({
    error: 'Please choose whether there is any heating or cooling equipment!',
  }),
  floorType: z.enum(ACCESSORY_BUILDING_FLOOR_TYPES),

  electricalServiceType: z.enum(ACCESSORY_BUILDING_SERVICE_TYPES),
  serviceSize: z.enum(ACCESSORY_BUILDING_SERVICE_SIZES).optional(),
  serviceSizeOther: z.string().optional(),
  dedicatedCircuitsCount: z.enum(ACCESSORY_BUILDING_CIRCUIT_COUNTS).optional(),
  dedicatedCircuitAmpRating: z
    .enum(ACCESSORY_BUILDING_CIRCUIT_AMP_RATINGS)
    .optional(),

  panelLocation: z.enum(ACCESSORY_BUILDING_PANEL_LOCATIONS),
  panelLocationOther: z.string().optional(),

  panelPhotos: z.array(z.string()).optional(),
  routeDetails: z.string().optional(),
  existingSpacePhotos: z.array(z.string()).optional(),

  hasPlansDrawings: z.boolean({
    error: 'Please choose whether you have plans/drawings!',
  }),
  plansDrawings: z.array(z.string()).optional(),
  permitApplied: z.boolean({
    error: 'Please choose whether a permit has been applied for!',
  }),
  permitNumber: z.string().optional(),
  additionalInformation: z.string().optional(),
  status: z.enum(Service_STATUSES).optional(),
  completionPercentage: z.number().optional(),
});

// Photo presence (panelPhotos, existingSpacePhotos, plansDrawings) is enforced in
// the service because images now arrive as form-data files, not in `data`.
const accessoryBuildingPowerCreateBodySchema = accessoryBuildingPowerBodySchema;

const validateAccessoryBuildingPowerConditionalFields = (
  data: {
    electricalServiceType?: (typeof ACCESSORY_BUILDING_SERVICE_TYPES)[number];
    serviceSize?: (typeof ACCESSORY_BUILDING_SERVICE_SIZES)[number];
    serviceSizeOther?: string;
    dedicatedCircuitsCount?: (typeof ACCESSORY_BUILDING_CIRCUIT_COUNTS)[number];
    dedicatedCircuitAmpRating?: (typeof ACCESSORY_BUILDING_CIRCUIT_AMP_RATINGS)[number];
    panelLocation?: (typeof ACCESSORY_BUILDING_PANEL_LOCATIONS)[number];
    panelLocationOther?: string;
    hasPlansDrawings?: boolean;
    plansDrawings?: string[];
    permitApplied?: boolean;
    permitNumber?: string;
  },
  ctx: z.RefinementCtx,
) => {
  if (
    (data.electricalServiceType === 'New Service' ||
      data.electricalServiceType === 'Sub-panel') &&
    !data.serviceSize
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['serviceSize'],
      message: 'Service size is required for new service or sub-panel!',
    });
  }

  if (data.serviceSize === 'Other' && !data.serviceSizeOther) {
    ctx.addIssue({
      code: 'custom',
      path: ['serviceSizeOther'],
      message: 'Please specify the service size when choosing Other!',
    });
  }

  if (
    data.electricalServiceType === '1-2 dedicated circuits' &&
    !data.dedicatedCircuitsCount
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['dedicatedCircuitsCount'],
      message: 'Please choose whether you need 1 or 2 dedicated circuits!',
    });
  }

  if (
    data.electricalServiceType === '1-2 dedicated circuits' &&
    !data.dedicatedCircuitAmpRating
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['dedicatedCircuitAmpRating'],
      message: 'Please choose amp rating for the circuit(s)!',
    });
  }

  if (
    data.panelLocation === 'Other (please specify)' &&
    !data.panelLocationOther
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['panelLocationOther'],
      message: 'Please specify your panel location!',
    });
  }

  if (data.permitApplied === true && !data.permitNumber) {
    ctx.addIssue({
      code: 'custom',
      path: ['permitNumber'],
      message: 'Permit number is required when a permit has been applied for!',
    });
  }
};

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
        if (data.status === Service_STATUSES.DRAFT) {
          const res = accessoryBuildingPowerBodySchema
            .partial()
            .safeParse(data);
          if (!res.success) {
            res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
          }
        } else {
          const res = accessoryBuildingPowerCreateBodySchema.safeParse(data);
          if (res.success) {
            validateAccessoryBuildingPowerConditionalFields(data, ctx);
          } else {
            res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
          }
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
      .extend({
        status: z.enum(Service_STATUSES).optional(),
      })
      .superRefine(validateAccessoryBuildingPowerConditionalFields),
  }),
};
