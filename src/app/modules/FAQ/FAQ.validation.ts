import { z } from 'zod';
import { ContentType } from './appContent.model';

export const FAQValidation = {
  createSchema: z.object({
    body: z.object({
      question: z.string({ error: 'Question is required!' }).trim().min(1),
      answer: z.string({ error: 'Answer is required!' }).trim().min(1),
    }),
  }),

  updateSchema: z.object({
    params: z.object({
      id: z.string({ error: 'FAQ ID is required!' }).min(1),
    }),
    body: z
      .object({
        question: z.string().trim().min(1).optional(),
        answer: z.string().trim().min(1).optional(),
      })
      .refine(
        data => data.question !== undefined || data.answer !== undefined,
        { message: 'Provide a question or answer to update!' },
      ),
  }),

  updateAppContentSchema: z.object({
    body: z.object({
      content: z
        .string({ error: 'Content is required!' })
        .trim()
        .min(1, 'Content cannot be empty!'),
    }),
    params: z.object({
      type: z.enum([ContentType.ABOUT_US, ContentType.TERMS_AND_CONDITIONS], {
        error: 'Invalid content type!',
      }),
    }),
  }),

  idParamsSchema: z.object({
    params: z.object({
      id: z.string({ error: 'FAQ ID is required!' }).min(1),
    }),
  }),
};
