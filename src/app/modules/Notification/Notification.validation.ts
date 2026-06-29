import { z } from 'zod';

const idParamsSchema = z.object({
  params: z.object({
    id: z.string({ error: 'Notification ID is required!' }).min(1),
  }),
});

const getMyNotificationsSchema = z.object({
  query: z
    .object({
      page: z.string().optional(),
      limit: z.string().optional(),
      sort: z.string().optional(),
      fields: z.string().optional(),
      isRead: z.enum(['true', 'false']).optional(),
    })
    .optional(),
});

export const NotificationValidation = {
  idParamsSchema,
  getMyNotificationsSchema,
};
