import { z } from 'zod';
import { SERVICE_CALL_PREFERRED_TIMES } from './ServiceCall.interface';
import {
  CONTACT_METHODS,
  OWNERSHIP_STATUSES,
  PROPERTY_TYPES,
  TIMELINE_URGENCIES,
  Service_STATUSES,
} from '../../constants';

const serviceCallBodySchema = z.object({
  serviceType: z.string().optional(),
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
  issueDescription: z
    .string({ error: 'Issue description is required!' })
    .min(1),
  preferredTime: z.enum(SERVICE_CALL_PREFERRED_TIMES).optional(),
  schedulingPreference: z.array(z.string()).optional(),
  panelPhotos: z.array(z.string()).optional(),
  workAreaPhotos: z.array(z.string()).optional(),
  extraReferencePhotos: z.array(z.string()).optional(),
  notes: z.string().optional(),
  quickTags: z.array(z.string()).optional(),
  status: z.enum(Service_STATUSES).optional(),
  completionPercentage: z.number().optional(),
});

export const ServiceCallValidation = {
  createServiceCallSchema: z.object({
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
        const res = serviceCallBodySchema.partial().safeParse(data);
        if (!res.success) {
          res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
        }
      } else {
        const res = serviceCallBodySchema.safeParse(data);
        if (!res.success) {
          res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
        }
      }
    }),
  }),

  serviceCallIdParamsSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Service call ID is required!' }).min(1),
    }),
  }),

  updateServiceCallSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Service call ID is required!' }).min(1),
    }),
    body: z.object({
      serviceType: z.string().optional(),
      fullName: z.string().optional(),
      phoneNumber: z.string().optional(),
      emailAddress: z.string().email('Invalid email format!').optional(),
      preferredContactMethod: z.enum(CONTACT_METHODS).optional(),
      streetAddress: z.string().optional(),
      apartmentUnit: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      propertyType: z.enum(PROPERTY_TYPES).optional(),
      ownershipStatus: z.enum(OWNERSHIP_STATUSES).optional(),
      timelineUrgency: z.enum(TIMELINE_URGENCIES).optional(),
      issueDescription: z.string().optional(),
      preferredTime: z.enum(SERVICE_CALL_PREFERRED_TIMES).optional(),
      schedulingPreference: z.array(z.string()).optional(),
      panelPhotos: z.array(z.string()).optional(),
      workAreaPhotos: z.array(z.string()).optional(),
      extraReferencePhotos: z.array(z.string()).optional(),
      notes: z.string().optional(),
      quickTags: z.array(z.string()).optional(),
      status: z.enum(Service_STATUSES).optional(),
      completionPercentage: z.number().optional(),
    }).refine(
      data =>
        Object.values(data).some(
          value => value !== undefined && value !== null,
        ),
      {
        message: 'At least one field is required to update!',
      },
    ),
  }),
};
