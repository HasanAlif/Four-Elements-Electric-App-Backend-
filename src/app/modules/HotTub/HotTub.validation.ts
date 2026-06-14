import { z } from 'zod';
import {
  CONTACT_METHODS,
  PROPERTY_TYPES,
  TIMELINE_URGENCIES,
  Service_STATUSES,
} from '../../constants';
import {
  HOT_TUB_AMPERAGES,
  HOT_TUB_LOCATIONS,
  HOT_TUB_PANEL_DISTANCE,
  HOT_TUB_PANEL_LOCATIONS,
} from './HotTub.interface';

const hotTubBodySchema = z.object({
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
  ownershipStatus: z.enum(['Owner', 'Tenant', 'Property Manager', 'Other']),
  timelineUrgency: z.enum(TIMELINE_URGENCIES),

  hasDigitalManual: z.boolean({
    error: 'Please choose whether you have a digital manual!',
  }),
  manualDocument: z.string().optional(),
  hotTubManufacturer: z.string().optional(),
  hotTubModelNumber: z.string().optional(),

  amperageNeeded: z.enum(HOT_TUB_AMPERAGES).optional(),
  location: z.enum(HOT_TUB_LOCATIONS),
  panelLocation: z.enum(HOT_TUB_PANEL_LOCATIONS).optional(),
  panelDistance: z.enum(HOT_TUB_PANEL_DISTANCE).optional(),

  panelPhotos: z.array(z.string()).optional(),
  hotTubPhotos: z.array(z.string()).optional(),
  receptaclePhotos: z.array(z.string()).optional(),

  additionalInformation: z.string().optional(),
  status: z.enum(Service_STATUSES).optional(),
  completionPercentage: z.number().optional(),
});

const hotTubCreateBodySchema = hotTubBodySchema.extend({
  panelPhotos: z
    .array(z.string())
    .min(1, 'Please upload photo(s) of electrical panel!'),
  hotTubPhotos: z
    .array(z.string())
    .min(1, 'Please upload photo(s) of the hot tub!'),
});

const validateHotTubConditionalFields = (
  data: {
    amperageNeeded?: (typeof HOT_TUB_AMPERAGES)[number];
    panelLocation?: (typeof HOT_TUB_PANEL_LOCATIONS)[number];
    panelDistance?: (typeof HOT_TUB_PANEL_DISTANCE)[number];
    hasDigitalManual?: boolean;
    manualDocument?: string;
  },
  ctx: z.RefinementCtx,
) => {
  if (data.hasDigitalManual === true && !data.manualDocument) {
    ctx.addIssue({
      code: 'custom',
      path: ['manualDocument'],
      message: 'Please upload the digital manual!',
    });
  }
};

export const HotTubValidation = {
  createSchema: z.object({
    body: z.any().transform((data) => {
      if (typeof data !== 'object' || data === null) return data;
      const cleanData = { ...data };
      for (const key in cleanData) {
        if (cleanData[key] === '' || cleanData[key] === null) {
          delete cleanData[key];
        } else if (Array.isArray(cleanData[key])) {
          cleanData[key] = cleanData[key].filter((v: any) => v !== '' && v !== null);
          if (cleanData[key].length === 0) delete cleanData[key];
        }
      }
      return cleanData;
    }).superRefine((data, ctx) => {
      if (data.status === Service_STATUSES.DRAFT) {
        const res = hotTubBodySchema.partial().safeParse(data);
        if (!res.success) {
          res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
        }
      } else {
        const res = hotTubCreateBodySchema.safeParse(data);
        if (res.success) {
          validateHotTubConditionalFields(data, ctx);
        } else {
          res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
        }
      }
    }),
  }),

  idParamsSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Hot tub request ID is required!' }).min(1),
    }),
  }),

  updateSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Hot tub request ID is required!' }).min(1),
    }),
    body: hotTubBodySchema
      .partial()
      .extend({ status: z.enum(Service_STATUSES).optional() })
      .refine(
        data =>
          Object.values(data).some(
            value => value !== undefined && value !== null,
          ),
        { message: 'At least one field is required to update!' },
      )
      .superRefine(validateHotTubConditionalFields),
  }),
};
