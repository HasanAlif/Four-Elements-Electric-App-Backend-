import { z } from 'zod';
import {
  EV_CHARGER_CONNECTION_TYPES,
  EV_CHARGER_DISTANCES,
  EV_CHARGER_INSTALLATION_LOCATIONS,
  EV_CHARGER_PANEL_LOCATIONS,
  EV_CHARGER_STATUSES,
} from './EVChargerInstallation.interface';
import {
  CONTACT_METHODS,
  OWNERSHIP_STATUSES,
  PROPERTY_TYPES,
  TIMELINE_URGENCIES,
  Service_STATUSES,
} from '../../constants';

const evChargerBodySchema = z.object({
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

  chargerConnectionType: z.enum(EV_CHARGER_CONNECTION_TYPES),
  nemaConfiguration: z.string().optional(),
  chargerProvidedByUser: z.boolean().optional(),
  chargerStatus: z.enum(EV_CHARGER_STATUSES).optional(),

  installationLocation: z.enum(EV_CHARGER_INSTALLATION_LOCATIONS),
  panelLocation: z.enum(EV_CHARGER_PANEL_LOCATIONS),
  panelDistance: z.enum(EV_CHARGER_DISTANCES),

  environment: z.string().optional(),
  budget: z.string().optional(),
  accessibility: z.string().optional(),
  schedule: z.string().optional(),

  additionalInformation: z.string().optional(),
  areaPhoto: z.string().optional(),
  panelPhotos: z.array(z.string()).optional(),
  status: z.enum(Service_STATUSES).optional(),
  completionPercentage: z.number().optional(),
});

const validateEVChargerConditionalFields = (
  data: any,
  ctx: z.RefinementCtx,
) => {
  if (
    data.chargerConnectionType !== 'I want help deciding' &&
    data.chargerProvidedByUser === undefined
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['chargerProvidedByUser'],
      message: 'Please choose whether you will provide the charger!',
    });
  }

  if (
    data.chargerConnectionType !== 'I want help deciding' &&
    !data.chargerStatus
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['chargerStatus'],
      message: 'Charger status is required!',
    });
  }

  if (data.chargerConnectionType === 'Plug-in' && !data.nemaConfiguration) {
    ctx.addIssue({
      code: 'custom',
      path: ['nemaConfiguration'],
      message: 'NEMA configuration is required for plug-in chargers!',
    });
  }
};

export const EVChargerInstallationValidation = {
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
          const res = evChargerBodySchema.partial().safeParse(data);
          if (!res.success) {
            res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
          }
        } else {
          const res = evChargerBodySchema.safeParse(data);
          if (res.success) {
            validateEVChargerConditionalFields(data, ctx);
          } else {
            res.error.issues.forEach(i => ctx.addIssue(i as z.IssueData));
          }
        }
      }),
  }),

  idParamsSchema: z.object({
    params: z.object({
      id: z.string({ error: 'EV charger installation ID is required!' }).min(1),
    }),
  }),

  updateSchema: z.object({
    params: z.object({
      id: z.string({ error: 'EV charger installation ID is required!' }).min(1),
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

        chargerConnectionType: z.enum(EV_CHARGER_CONNECTION_TYPES).optional(),
        nemaConfiguration: z.string().optional(),
        chargerProvidedByUser: z.boolean().optional(),
        chargerStatus: z.enum(EV_CHARGER_STATUSES).optional(),

        installationLocation: z
          .enum(EV_CHARGER_INSTALLATION_LOCATIONS)
          .optional(),
        panelLocation: z.enum(EV_CHARGER_PANEL_LOCATIONS).optional(),
        panelDistance: z.enum(EV_CHARGER_DISTANCES).optional(),

        environment: z.string().optional(),
        budget: z.string().optional(),
        accessibility: z.string().optional(),
        schedule: z.string().optional(),

        additionalInformation: z.string().optional(),
        areaPhoto: z.string().optional(),
        panelPhotos: z.array(z.string()).optional(),
        status: z.enum(Service_STATUSES).optional(),
      })
      .superRefine((data, ctx) => {
        if (
          data.chargerConnectionType !== 'I want help deciding' &&
          data.chargerProvidedByUser === undefined
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['chargerProvidedByUser'],
            message: 'Please choose whether you will provide the charger!',
          });
        }

        if (
          data.chargerConnectionType !== 'I want help deciding' &&
          !data.chargerStatus
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['chargerStatus'],
            message: 'Charger status is required!',
          });
        }

        if (
          data.chargerConnectionType === 'Plug-in' &&
          !data.nemaConfiguration
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['nemaConfiguration'],
            message: 'NEMA configuration is required for plug-in chargers!',
          });
        }
      }),
  }),
};
