import { z } from 'zod';

// Admin create: all three fields required; steps is a non-empty array of non-empty strings.
const createGuideSchema = z.object({
  body: z.object({
    name: z.string({ error: 'Name is required!' }).trim().min(1),
    safetyWarnings: z
      .string({ error: 'Safety warnings are required!' })
      .trim()
      .min(1),
    steps: z
      .array(z.string().trim().min(1, 'A step cannot be empty!'), {
        error: 'Steps are required!',
      })
      .min(1, 'Provide at least one step!'),
  }),
});

// Shared `:id` param guard for single / save / unsave.
const idParamsSchema = z.object({
  params: z.object({
    id: z.string({ error: 'Guide ID is required!' }).min(1),
  }),
});

// Optional list/pagination query (list + saved-list).
const listQuerySchema = z.object({
  query: z
    .object({
      page: z.string().optional(),
      limit: z.string().optional(),
      sort: z.string().optional(),
      fields: z.string().optional(),
      searchTerm: z.string().optional(),
    })
    .optional(),
});

export const GuideValidation = {
  createGuideSchema,
  idParamsSchema,
  listQuerySchema,
};
