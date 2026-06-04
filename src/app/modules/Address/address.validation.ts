import { z } from 'zod';

export const AddressValidation = {
  createAddressSchema: z.object({
    body: z.object({
      addressName: z.string({ error: 'Address name is required!' }).min(1),
      streetAddress: z
        .string({ error: 'Street address is required!' })
        .min(1),
      apartmentUnit: z.string().optional(),
      city: z.string({ error: 'City is required!' }).min(1),
      state: z.string({ error: 'State is required!' }).min(1),
      zipCode: z.string({ error: 'ZIP code is required!' }).min(1),
      isDefault: z.boolean().optional(),
    }),
  }),

  addressIdParamsSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Address ID is required!' }).min(1),
    }),
  }),

  updateAddressSchema: z.object({
    params: z.object({
      id: z.string({ error: 'Address ID is required!' }).min(1),
    }),
    body: z
      .object({
        addressName: z.string().optional(),
        streetAddress: z.string().optional(),
        apartmentUnit: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
      .refine(
        data =>
          Object.values(data).some(
            value => value !== undefined && value !== null,
          ),
        {
          message: 'At least one field is required to update!',
        },
      ),
  }),
};
