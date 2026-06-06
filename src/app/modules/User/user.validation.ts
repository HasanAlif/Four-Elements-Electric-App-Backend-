import { z } from 'zod';
import { AUTH_PROVIDER } from './user.constant';

// Reusable validators
export const zodEnumFromObject = <T extends Record<string, string>>(obj: T) =>
  z.enum([...Object.values(obj)] as [string, ...string[]]);

// 1. createUserSchema
const createUserSchema = z.object({
  body: z.object({
    name: z
      .string({
        error: 'Name is required',
      })
      .min(3, { message: 'Name must be at least 3 characters long' })
      .max(20, { message: 'Name cannot exceed 20 characters' }),
    // address: z.string({
    //   error: 'Address is required',
    // }),
    phone: z.string({
      error: 'Phone is required',
    }),
    email: z
      .string({
        error: 'Email is required!',
      })
      .email({ message: 'Invalid email format!' }) // Ensure it's a valid email
      .transform(email => email.toLowerCase()) // Convert email to lowercase
      .refine(email => email !== '', { message: 'Email is required!' }) // Check that email is not empty
      .refine(value => typeof value === 'string', {
        message: 'Email must be string!', // Check that email is string
      }),

    password: z
      .string({
        error: 'Password is required',
      })
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(20, { message: 'Password cannot exceed 20 characters' }),

    // role: zodEnumFromObject(ROLE),
  }),
});

// 2. sendSignupOtpAgainSchema
const sendSignupOtpAgainSchema = z.object({
  body: z.object({
    userEmail: z
      .string({
        error: 'Email is required!',
      })
      .email({ message: 'Invalid email format!' }) // Ensure it's a valid email
      .transform(email => email.toLowerCase()) // Convert email to lowercase
      .refine(email => email !== '', { message: 'Email is required!' }) // Check that email is not empty
      .refine(value => typeof value === 'string', {
        message: 'Email must be string!', // Check that email is string
      }),
  }),
});

// 3. verifySignupOtpSchema
const verifySignupOtpSchema = z.object({
  body: z.object({
    userEmail: z
      .string({
        error: 'Email is required!',
      })
      .email({ message: 'Invalid email format!' }) // Ensure it's a valid email
      .transform(email => email.toLowerCase()) // Convert email to lowercase
      .refine(email => email !== '', { message: 'Email is required!' }) // Check that email is not empty
      .refine(value => typeof value === 'string', {
        message: 'Email must be string!', // Check that email is string
      }),

    otp: z
      .string({
        error: 'OTP is required!',
      })
      .regex(/^\d+$/, { message: 'OTP must be a number!' })
      .length(6, { message: 'OTP must be exactly 6 digits' }),
  }),
});

// 5. signinSchema
const signinSchema = z.object({
  body: z.object({
    email: z
      .string({
        error: 'Email is required!',
      })
      .email({ message: 'Invalid email format!' }) // Ensure it's a valid email
      .transform(email => email.toLowerCase()) // Convert email to lowercase
      .refine(email => email !== '', { message: 'Email is required!' }) // Check that email is not empty
      .refine(value => typeof value === 'string', {
        message: 'Email must be string!', // Check that email is string
      }),

    password: z
      .string({
        error: 'Password is required!',
      })
      .min(8, { message: 'Password must be at least 8 characters long!' })
      .max(20, { message: 'Password cannot exceed 20 characters!' }),
  }),
});

// 6. socialSigninSchema
const socialSigninSchema = z.object({
  body: z.object({
    provider: zodEnumFromObject(AUTH_PROVIDER),
    idToken: z.string({
      error: 'ID token is required!',
    }),
    name: z.string().optional(),
  }),
});

// 7. updateUserDataSchema
const updateUserDataSchema = z.object({
  body: z.object({
    name: z.string().optional(),

    address: z.string().optional(),

    phone: z.string().optional(),
  }),
});

// 8. changePasswordSchema
const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z
      .string({
        error: 'Old password is required!',
      })
      .min(8, { message: 'Old password must be at least 8 characters long!' })
      .max(20, { message: 'Old password cannot exceed 20 characters!' }),

    newPassword: z
      .string({
        error: 'New password is required!',
      })
      .min(8, { message: 'New password must be at least 8 characters long!' })
      .max(20, { message: 'New password cannot exceed 20 characters!' }),
  }),
});

// 9. forgotPasswordSchema
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        error: 'Email is required!',
      })
      .email({ message: 'Invalid email format!' }) // Ensure it's a valid email
      .transform(email => email.toLowerCase()) // Convert email to lowercase
      .refine(email => email !== '', { message: 'Email is required!' }) // Check that email is not empty
      .refine(value => typeof value === 'string', {
        message: 'Email must be string!', // Check that email is string
      }),
  }),
});

// 10. sendForgotPasswordOtpAgainSchema
const sendForgotPasswordOtpAgainSchema = z.object({
  body: z.object({
    token: z.string({ error: 'Token is required!' }),
  }),
});

// 11. verifyOtpForForgotPasswordSchema
const verifyOtpForForgotPasswordSchema = z.object({
  body: z.object({
    token: z.string({ error: 'Token is required!' }),
    otp: z
      .string({
        error: 'OTP is required!',
      })
      .regex(/^\d+$/, { message: 'OTP must be a number!' })
      .length(6, { message: 'OTP must be exactly 6 digits' }),
  }),
});

// 12. resetPasswordSchema
const resetPasswordSchema = z.object({
  body: z.object({
    resetPasswordToken: z.string({
      error: 'Reset password token is required!',
    }),

    newPassword: z
      .string({
        error: 'New password is required!',
      })
      .min(8, { message: 'New password must be at least 8 characters long!' })
      .max(20, { message: 'New password cannot exceed 20 characters!' }),
  }),
});

// 14. getNewAccessTokenSchema
const getNewAccessTokenSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      error: 'Refresh token is required!',
    }),
  }),
});

// 15. deactivateUserAccountSchema
const deactivateUserAccountSchema = z.object({
  body: z
    .object({
      email: z
        .string({
          error: 'Email is required!',
        })
        .email('Invalid email format!')
        .transform(email => email.toLowerCase())
        .refine(email => email !== '', { message: 'Email is required!' })
        .refine(value => typeof value === 'string', {
          message: 'Email must be string!',
        }),

      password: z
        .string({
          error: 'Password is required!',
        })
        .min(8, { message: 'Password must be at least 8 characters long!' })
        .max(20, { message: 'Password cannot exceed 20 characters!' }),

      deactivationReason: z
        .string({
          error: 'Deactivation reason is required!',
        })
        .min(3, 'Reason must be at least 3 characters!')
        .max(200, 'Reason cannot exceed 200 characters!'),
    })
    .strict(),
});

// 16. deleteImageSchema
const deleteImageSchema = z.object({
  body: z.object({
    imageUrl: z.string({
      error: 'Image URL is required!',
    }),
  }),
});

export const UserValidation = {
  createUserSchema,
  sendSignupOtpAgainSchema,
  verifySignupOtpSchema,
  signinSchema,
  socialSigninSchema,
  updateUserDataSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  sendForgotPasswordOtpAgainSchema,
  verifyOtpForForgotPasswordSchema,
  resetPasswordSchema,
  getNewAccessTokenSchema,
  deactivateUserAccountSchema,
  deleteImageSchema,
};
