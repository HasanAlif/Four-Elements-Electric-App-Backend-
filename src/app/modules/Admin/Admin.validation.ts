import { z } from 'zod';
import { Service_STATUSES } from '../../constants';

export const AdminValidation = {
  idParamsSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Quote ID is required!' }).min(1),
    }),
  }),

  updateQuoteStatusSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Quote ID is required!' }).min(1),
    }),
    body: z
      .object({
        status: z
          .enum(Service_STATUSES)
          .refine(value => value !== Service_STATUSES.DRAFT, {
            message: 'Status cannot be set to draft!',
          })
          .optional(),
        internalNote: z.string().trim().optional(),
      })
      .refine(
        data => data.status !== undefined || data.internalNote !== undefined,
        { message: 'Provide a status or internalNote to update!' },
      ),
  }),

  createCategorySchema: z.object({
    body: z.object({
      name: z.string({ error: 'Category name is required!' }).trim().min(1),
      description: z.string().trim().optional(),
      isActive: z.boolean().optional(),
    }),
  }),

  updateCategorySchema: z.object({
    params: z.object({
      id: z.string({ error: 'Category ID is required!' }).min(1),
    }),
    body: z
      .object({
        name: z.string().trim().min(1).optional(),
        description: z.string().trim().optional(),
        isActive: z.boolean().optional(),
      })
      .refine(
        data =>
          data.name !== undefined ||
          data.description !== undefined ||
          data.isActive !== undefined,
        { message: 'Provide at least one field to update!' },
      ),
  }),

  categoryIdParamsSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Category ID is required!' }).min(1),
    }),
  }),

  createPartnerSchema: z.object({
    body: z.object({
      companyName: z
        .string({ error: 'Partner company name is required!' })
        .trim()
        .min(1),
      category: z
        .string({ error: 'Partner category is required!' })
        .trim()
        .min(1),
      description: z.string().trim().optional(),
      phoneNumber: z.string().trim().optional(),
      websiteUrl: z.string().trim().optional(),
      isVerified: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }),
  }),

  updatePartnerSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Partner ID is required!' }).min(1),
    }),
    body: z
      .object({
        companyName: z.string().trim().min(1).optional(),
        category: z.string().trim().min(1).optional(),
        description: z.string().trim().optional(),
        phoneNumber: z.string().trim().optional(),
        websiteUrl: z.string().trim().optional(),
        isVerified: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
      .refine(data => Object.keys(data).length > 0, {
        message: 'Provide at least one field to update!',
      }),
  }),

  partnerIdParamsSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Partner ID is required!' }).min(1),
    }),
  }),

  changePasswordSchema: z.object({
    body: z.object({
      oldPassword: z
        .string({ error: 'Old password is required!' })
        .min(8, { message: 'Old password must be at least 8 characters long!' })
        .max(20, { message: 'Old password cannot exceed 20 characters!' }),
      newPassword: z
        .string({ error: 'New password is required!' })
        .min(8, { message: 'New password must be at least 8 characters long!' })
        .max(20, { message: 'New password cannot exceed 20 characters!' }),
    }),
  }),

  createAdminUserSchema: z.object({
    body: z.object({
      firstName: z.string({ error: 'First name is required!' }).trim().min(1),
      lastName: z.string({ error: 'Last name is required!' }).trim().min(1),
      phone: z.string({ error: 'Phone is required!' }).trim().min(1),
      email: z
        .string({ error: 'Email is required!' })
        .email({ message: 'Invalid email format!' })
        .transform(e => e.toLowerCase()),
      password: z
        .string({ error: 'Password is required!' })
        .min(8, { message: 'Password must be at least 8 characters long!' })
        .max(20, { message: 'Password cannot exceed 20 characters!' }),
    }),
  }),
};
