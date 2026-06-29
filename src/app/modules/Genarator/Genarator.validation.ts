import { z } from 'zod';
import {
  CONTACT_METHODS,
  OWNERSHIP_STATUSES,
  PROPERTY_TYPES,
  TIMELINE_URGENCIES,
  Service_STATUSES,
} from '../../constants';

const genaratorBodySchema = z.object({
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

  generatorType: z.string().optional(),
  isAlreadyHaveGenerator: z.boolean().optional(),
  generatorOutputPower: z.string().optional(),
  preferredBackupInstallation: z.string().optional(),
  generatorDistanceFromInletLocation: z.string().optional(),
  electricPanelLocation: z.string().optional(),
  sizeOfGeneratorWanted: z.string().optional(),
  backupNeeds: z.string().optional(),
  isHavePropane: z.boolean().optional(),

  photosOfWhereGeneratorWillBeInlet: z.array(z.string()).optional(),
  photosOfReceptacleOnGenerator: z.array(z.string()).optional(),
  electricPanelPhotos: z.array(z.string()).optional(),
  generatorInstallationLocationPhotos: z.array(z.string()).optional(),
  photosOfElectricalMeter: z.array(z.string()).optional(),

  status: z.enum(Service_STATUSES).optional(),
  completionPercentage: z.number().optional(),
});

export const GenaratorValidation = {
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
            ? genaratorBodySchema.partial().safeParse(data)
            : genaratorBodySchema.safeParse(data);
        if (!res.success) {
          res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
        }
      }),
  }),

  idParamsSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Generator request ID is required!' }).min(1),
    }),
  }),

  updateSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Generator request ID is required!' }).min(1),
    }),
    body: genaratorBodySchema
      .partial()
      .extend({ status: z.enum(Service_STATUSES).optional() }),
  }),
};
