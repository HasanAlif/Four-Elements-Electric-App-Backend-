import { z } from 'zod';
import {
  CONTACT_METHODS,
  OWNERSHIP_STATUSES,
  PROPERTY_TYPES,
  TIMELINE_URGENCIES,
  Service_STATUSES,
} from '../../constants';
import {
  DOCK_POWER_CIRCUIT_AMP_RATINGS,
  DOCK_POWER_CIRCUIT_COUNTS,
  DOCK_POWER_NEW_SERVICE_SIZES,
  DOCK_POWER_SERVICE_TYPES,
  DOCK_POWER_SUB_PANEL_SIZES,
} from './DockPower.interface';

const dockPowerBodySchema = z.object({
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

  isDockBuilt: z.boolean().optional(),
  electricalNeedsDetails: z.string().optional(),
  receptacleCount: z.coerce
    .number()
    .min(0, 'Receptacle count cannot be negative!')
    .optional(),

  electricalServiceType: z.enum(DOCK_POWER_SERVICE_TYPES).optional(),
  newServiceSize: z.enum(DOCK_POWER_NEW_SERVICE_SIZES).optional(),
  subPanelSize: z.enum(DOCK_POWER_SUB_PANEL_SIZES).optional(),
  serviceSizeOther: z.string().optional(),
  dedicatedCircuitsCount: z.enum(DOCK_POWER_CIRCUIT_COUNTS).optional(),
  dedicatedCircuitAmpRating: z.enum(DOCK_POWER_CIRCUIT_AMP_RATINGS).optional(),

  panelLocation: z.string().optional(),
  panelLocationOther: z.string().optional(),

  panelPhotos: z.array(z.string()).optional(),
  privateUtilitiesDetails: z.string().optional(),
  routeDistanceDetails: z.string().optional(),
  existingSpacePhotos: z.array(z.string()).optional(),

  hasPlansDrawings: z.boolean().optional(),
  plansDrawingsPhotos: z.array(z.string()).optional(),
  permitApplied: z.boolean().optional(),
  permitNumber: z.string().optional(),
  additionalInformation: z.string().optional(),
  status: z.enum(Service_STATUSES).optional(),
  completionPercentage: z.number().optional(),
});

export const DockPowerValidation = {
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
            ? dockPowerBodySchema.partial().safeParse(data)
            : dockPowerBodySchema.safeParse(data);
        if (!res.success) {
          res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
        }
      }),
  }),

  idParamsSchema: z.object({
    params: z.object({
      id: z
        .string({
          error: 'Dock power request ID is required!',
        })
        .min(1),
    }),
  }),

  updateSchema: z.object({
    params: z.object({
      id: z
        .string({
          error: 'Dock power request ID is required!',
        })
        .min(1),
    }),
    body: dockPowerBodySchema
      .partial()
      .extend({ status: z.enum(Service_STATUSES).optional() }),
  }),
};
