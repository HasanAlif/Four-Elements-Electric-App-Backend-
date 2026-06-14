import { z } from 'zod';
import {
  PANEL_AMPERAGES,
  PANEL_LOCATIONS,
  PANEL_POWER_FEEDS,
  PANEL_SERVICE_TYPES,
} from './PanelUpgradeReplacement.interface';
import {
  CONTACT_METHODS,
  OWNERSHIP_STATUSES,
  PROPERTY_TYPES,
  TIMELINE_URGENCIES,
  Service_STATUSES,
} from '../../constants';

const panelBodySchema = z.object({
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

  panelServiceType: z.enum(PANEL_SERVICE_TYPES),
  currentPanelAmperage: z.enum(PANEL_AMPERAGES),
  desiredPanelAmperage: z.enum(PANEL_AMPERAGES).optional(),
  panelLocation: z.enum(PANEL_LOCATIONS),
  powerFeedType: z.enum(PANEL_POWER_FEEDS),

  meterPhotos: z.array(z.string()).optional(),
  panelPhotos: z.array(z.string()).optional(),
  additionalInformation: z.string().optional(),
  status: z.enum(Service_STATUSES).optional(),
  completionPercentage: z.number().optional(),
});

const validatePanelConditionalFields = (data: any, ctx: z.RefinementCtx) => {
  if (data.panelServiceType === 'Upgrade' && !data.desiredPanelAmperage) {
    ctx.addIssue({
      code: 'custom',
      path: ['desiredPanelAmperage'],
      message: 'Desired amperage is required for upgrades!',
    });
  }
};

export const PanelUpgradeReplacementValidation = {
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
          const res = panelBodySchema.partial().safeParse(data);
          if (!res.success) {
            res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
          }
        } else {
          const res = panelBodySchema.safeParse(data);
          if (res.success) {
            validatePanelConditionalFields(data, ctx);
          } else {
            res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
          }
        }
      }),
  }),

  idParamsSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Panel request ID is required!' }).min(1),
    }),
  }),

  updateSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Panel request ID is required!' }).min(1),
    }),
    body: z
      .object({
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

        panelServiceType: z.enum(PANEL_SERVICE_TYPES).optional(),
        currentPanelAmperage: z.enum(PANEL_AMPERAGES).optional(),
        desiredPanelAmperage: z.enum(PANEL_AMPERAGES).optional(),
        panelLocation: z.enum(PANEL_LOCATIONS).optional(),
        powerFeedType: z.enum(PANEL_POWER_FEEDS).optional(),

        meterPhotos: z.array(z.string()).optional(),
        panelPhotos: z.array(z.string()).optional(),
        additionalInformation: z.string().optional(),
        status: z.enum(Service_STATUSES).optional(),
        completionPercentage: z.number().optional(),
      })
      .superRefine((data, ctx) => {
        if (data.panelServiceType === 'Upgrade' && !data.desiredPanelAmperage) {
          ctx.addIssue({
            code: 'custom',
            path: ['desiredPanelAmperage'],
            message: 'Desired amperage is required for upgrades!',
          });
        }
      }),
  }),
};
