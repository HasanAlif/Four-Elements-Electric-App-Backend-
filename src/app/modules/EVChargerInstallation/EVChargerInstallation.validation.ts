import { z } from 'zod';

const statusValues = [
  'draft',
  'submitted',
  'in_review',
  'quoted',
  'scheduled',
  'completed',
  'cancelled',
] as const;

export const EVChargerInstallationValidation = {
  createSchema: z.object({
    body: z
      .object({
        fullName: z.string({ error: 'Full name is required!' }).min(1),
        phoneNumber: z.string({ error: 'Phone number is required!' }).min(1),
        emailAddress: z.string().email('Invalid email format!').optional(),
        preferredContactMethod: z.enum(['Call', 'Text', 'Email']).optional(),

        streetAddress: z
          .string({ error: 'Street address is required!' })
          .min(1),
        apartmentUnit: z.string().optional(),
        city: z.string({ error: 'City is required!' }).min(1),
        state: z.string({ error: 'State is required!' }).min(1),
        zipCode: z.string({ error: 'ZIP code is required!' }).min(1),

        propertyType: z.enum(['House', 'Condo', 'Apartment', 'Commercial']),
        ownershipStatus: z.enum([
          'Owner',
          'Tenant',
          'Property Manager',
          'Other',
        ]),
        timelineUrgency: z.enum([
          'As soon as possible',
          'This week',
          'This month',
          'Flexible',
        ]),

        chargerConnectionType: z.enum([
          'Plug-in',
          'Hardwired',
          'I want help deciding',
        ]),
        nemaConfiguration: z.string().optional(),
        chargerProvidedByUser: z.boolean().optional(),
        chargerStatus: z
          .enum([
            'Currently have the charger',
            'Ordered and waiting on delivery',
            'Need to place order',
            'Need help choosing a charger',
          ])
          .optional(),

        installationLocation: z.enum([
          'Garage',
          'Carport',
          'Driveway',
          'Other',
        ]),
        panelLocation: z.enum([
          'Basement (Finished)',
          'Basement (Unfinished)',
          'Garage (Finished)',
          'Garage (Unfinished)',
          'Other (please specify)',
        ]),
        panelDistance: z.enum([
          'Less than 25 ft',
          '25-50 ft',
          '50-100 ft',
          'More than 100 ft',
          'Unsure',
        ]),

        environment: z.string().optional(),
        budget: z.string().optional(),
        accessibility: z.string().optional(),
        schedule: z.string().optional(),

        additionalInformation: z.string().optional(),
        areaPhoto: z.string().optional(),
        panelPhotos: z.array(z.string()).optional(),
        notes: z.string().optional(),
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
        preferredContactMethod: z.enum(['Call', 'Text', 'Email']).optional(),

        streetAddress: z.string().optional(),
        apartmentUnit: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),

        propertyType: z
          .enum(['House', 'Condo', 'Apartment', 'Commercial'])
          .optional(),
        ownershipStatus: z
          .enum(['Owner', 'Tenant', 'Property Manager', 'Other'])
          .optional(),
        timelineUrgency: z
          .enum(['As soon as possible', 'This week', 'This month', 'Flexible'])
          .optional(),

        chargerConnectionType: z
          .enum(['Plug-in', 'Hardwired', 'I want help deciding'])
          .optional(),
        nemaConfiguration: z.string().optional(),
        chargerProvidedByUser: z.boolean().optional(),
        chargerStatus: z
          .enum([
            'Currently have the charger',
            'Ordered and waiting on delivery',
            'Need to place order',
            'Need help choosing a charger',
          ])
          .optional(),

        installationLocation: z
          .enum(['Garage', 'Carport', 'Driveway', 'Other'])
          .optional(),
        panelLocation: z
          .enum([
            'Basement (Finished)',
            'Basement (Unfinished)',
            'Garage (Finished)',
            'Garage (Unfinished)',
            'Other (please specify)',
          ])
          .optional(),
        panelDistance: z
          .enum([
            'Less than 25 ft',
            '25-50 ft',
            '50-100 ft',
            'More than 100 ft',
            'Unsure',
          ])
          .optional(),

        environment: z.string().optional(),
        budget: z.string().optional(),
        accessibility: z.string().optional(),
        schedule: z.string().optional(),

        additionalInformation: z.string().optional(),
        areaPhoto: z.string().optional(),
        panelPhotos: z.array(z.string()).optional(),
        notes: z.string().optional(),
        status: z.enum(statusValues).optional(),
      })
      .refine(
        data =>
          Object.values(data).some(
            value => value !== undefined && value !== null,
          ),
        {
          message: 'At least one field is required to update!',
        },
      )
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
