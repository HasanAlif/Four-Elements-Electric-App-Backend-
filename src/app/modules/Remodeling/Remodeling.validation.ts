import { z } from 'zod';
import {
  CONTACT_METHODS,
  OWNERSHIP_STATUSES,
  PROPERTY_TYPES,
  TIMELINE_URGENCIES,
  Service_STATUSES,
} from '../../constants';
import { REMODELING_PANEL_LOCATIONS } from './Remodeling.interface';

const remodelingBodySchema = z.object({
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

  panelLocation: z.enum(REMODELING_PANEL_LOCATIONS),
  remodelingAreas: z.string({ error: 'Remodeling area is required!' }).min(1),

  hasPlansDrawings: z.boolean({
    error: 'Please choose whether you have plans/drawings!',
  }),
  plansDrawings: z.array(z.string()).optional(),
  electricalNeeds: z.string({ error: 'Electrical needs are required!' }).min(1),

  permitApplied: z.boolean({
    error: 'Please choose whether a permit has been applied for!',
  }),
  permitNumber: z.string().optional(),
  additionalInformation: z.string().optional(),

  existingSpacePhotos: z.array(z.string()).optional(),
  panelPhotos: z.array(z.string()).optional(),
  status: z.enum(Service_STATUSES).optional(),
  completionPercentage: z.number().optional(),
});

const remodelingCreateBodySchema = remodelingBodySchema.extend({
  existingSpacePhotos: z
    .array(z.string())
    .min(1, 'Please upload photo of existing space!'),
  panelPhotos: z
    .array(z.string())
    .min(1, 'Please upload photos of your electrical panel!'),
});

const validateConditionalFields = (
  data: {
    hasPlansDrawings?: boolean;
    plansDrawings?: string[];
    permitApplied?: boolean;
    permitNumber?: string;
  },
  ctx: z.RefinementCtx,
) => {
  if (data.hasPlansDrawings === true && !data.plansDrawings?.length) {
    ctx.addIssue({
      code: 'custom',
      path: ['plansDrawings'],
      message: 'Please upload the plans/drawings!',
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

export const RemodelingValidation = {
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
        const res = remodelingBodySchema.partial().safeParse(data);
        if (!res.success) {
          res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
        }
      } else {
        const res = remodelingCreateBodySchema.safeParse(data);
        if (res.success) {
          validateConditionalFields(data, ctx);
        } else {
          res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
        }
      }
    }),
  }),

  idParamsSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Remodeling request ID is required!' }).min(1),
    }),
  }),

  updateSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Remodeling request ID is required!' }).min(1),
    }),
    body: remodelingBodySchema
      .partial()
      .extend({
        status: z.enum(Service_STATUSES).optional(),
      })
      .refine(
        data =>
          Object.values(data).some(
            value => value !== undefined && value !== null,
          ),
        { message: 'At least one field is required to update!' },
      )
      .superRefine(validateConditionalFields),
  }),
};
