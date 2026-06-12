import { z } from 'zod';
import {
  SERVICE_CALL_CONTACT_METHODS,
  SERVICE_CALL_OWNERSHIP_STATUSES,
  SERVICE_CALL_PREFERRED_TIMES,
  SERVICE_CALL_PROPERTY_TYPES,
  SERVICE_CALL_TIMELINE_URGENCIES,
} from './ServiceCall.interface';
import { Service_STATUSES } from '../../constants';

export const ServiceCallValidation = {
  createServiceCallSchema: z.object({
    body: z.object({
      serviceType: z.string().optional(),

      fullName: z.string({ error: 'Full name is required!' }).min(1),
      phoneNumber: z.string({ error: 'Phone number is required!' }).min(1),
      emailAddress: z.string().email('Invalid email format!').optional(),
      preferredContactMethod: z.enum(SERVICE_CALL_CONTACT_METHODS).optional(),

      streetAddress: z.string({ error: 'Street address is required!' }).min(1),
      apartmentUnit: z.string().optional(),
      city: z.string({ error: 'City is required!' }).min(1),
      state: z.string({ error: 'State is required!' }).min(1),
      zipCode: z.string({ error: 'ZIP code is required!' }).min(1),

      propertyType: z.enum(SERVICE_CALL_PROPERTY_TYPES),
      ownershipStatus: z.enum(SERVICE_CALL_OWNERSHIP_STATUSES),
      timelineUrgency: z.enum(SERVICE_CALL_TIMELINE_URGENCIES),

      issueDescription: z
        .string({ error: 'Issue description is required!' })
        .min(1),
      preferredTime: z.enum(SERVICE_CALL_PREFERRED_TIMES).optional(),
      schedulingPreference: z.array(z.string()).optional(),

      // installationLocation: z.string().optional(),
      // chargerOwnership: z.string().optional(),
      // chargerLevel: z.string().optional(),
      // panelLocation: z.string().optional(),
      // distance: z.string().optional(),
      // environment: z.string().optional(),
      // accessibility: z.string().optional(),

      panelPhotos: z.array(z.string()).optional(),
      workAreaPhotos: z.array(z.string()).optional(),
      extraReferencePhotos: z.array(z.string()).optional(),
      notes: z.string().optional(),
      quickTags: z.array(z.string()).optional(),
      status: z.enum(Service_STATUSES).optional(),
      completionPercentage: z.number().optional(),
    })
    .refine(
      data =>
        Object.values(data).some(
          value => value !== undefined && value !== null,
        ),
      {
        message: 'At least one field is required to update!',
      },
    ),
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
      preferredContactMethod: z.enum(SERVICE_CALL_CONTACT_METHODS).optional(),
      streetAddress: z.string().optional(),
      apartmentUnit: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      propertyType: z.enum(SERVICE_CALL_PROPERTY_TYPES).optional(),
      ownershipStatus: z.enum(SERVICE_CALL_OWNERSHIP_STATUSES).optional(),
      timelineUrgency: z.enum(SERVICE_CALL_TIMELINE_URGENCIES).optional(),
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
    }),
  }),
};
