import { z } from 'zod';
import { MAINTENANCE_FIELD_KEYS } from './maintenanceAlerts.constant';

// Each of the 7 fieldKeys is an optional boolean; the body must contain at least one.
// .strict() so a misspelled fieldKey is rejected loudly instead of silently ignored
// (the keys are a frontend API contract).
const toggleBodyShape = MAINTENANCE_FIELD_KEYS.reduce<
  Record<string, z.ZodOptional<z.ZodBoolean>>
>((shape, key) => {
  shape[key] = z.boolean().optional();
  return shape;
}, {});

const toggleMaintenanceAlertsSchema = z.object({
  body: z
    .object(toggleBodyShape)
    .strict()
    .refine(body => Object.keys(body).length > 0, {
      message: 'Provide at least one maintenance alert to update!',
    }),
});

export const MaintenanceAlertsValidation = {
  toggleMaintenanceAlertsSchema,
};
