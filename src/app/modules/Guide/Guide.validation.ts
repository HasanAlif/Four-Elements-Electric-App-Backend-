import { z } from 'zod';

const createGuideSchema = z.object({
  body: z.object({
    name: z.string({ error: 'Name is required!' }).trim().min(1),
    safetyWarnings: z
      .string({ error: 'Safety warnings are required!' })
      .trim()
      .min(1),
    steps: z
      .array(
        z.object({
          subtitle: z
            .string({ error: 'Subtitle is required!' })
            .trim()
            .min(1, 'Subtitle cannot be empty!'),
          description: z
            .string({ error: 'Description is required!' })
            .trim()
            .min(1, 'Description cannot be empty!'),
        }),
        { error: 'Steps are required!' },
      )
      .min(1, 'Provide at least one step!'),
  }),
});

const idParamsSchema = z.object({
  params: z.object({
    id: z.string({ error: 'Guide ID is required!' }).min(1),
  }),
});

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
