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
    phone: z.string({
      error: 'Phone is required',
    }),
    email: z
      .string({
        error: 'Email is required!',
      })
      .email({ message: 'Invalid email format!' })
      .transform(email => email.toLowerCase())
      .refine(email => email !== '', { message: 'Email is required!' })
      .refine(value => typeof value === 'string', {
        message: 'Email must be string!',
      }),

    password: z
      .string({
        error: 'Password is required',
      })
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(20, { message: 'Password cannot exceed 20 characters' }),

    // Optional device token to register at signup.
    fcmToken: z.string().min(1).optional(),

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

    // Optional device token to register when verification completes.
    fcmToken: z.string().min(1).optional(),
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

    // Optional device token to register on this device at login.
    fcmToken: z.string().min(1).optional(),
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
  body: z
    .object({
      name: z.string().optional(),

      address: z.string().optional(),

      phone: z.string().optional(),

      addresses: z
        .array(
          z.object({
            _id: z.string().optional(),
            addressName: z
              .string({ error: 'Address name is required!' })
              .min(1),
            streetAddress: z
              .string({ error: 'Street address is required!' })
              .min(1),
            apartmentUnit: z.string().optional(),
            city: z.string({ error: 'City is required!' }).min(1),
            state: z.string({ error: 'State is required!' }).min(1),
            zipCode: z.string({ error: 'ZIP code is required!' }).min(1),
            isDefault: z.boolean().optional(),
          }),
        )
        .optional(),
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

// 17. fcmTokenSchema (register / remove a device token)
const fcmTokenSchema = z.object({
  body: z.object({
    fcmToken: z
      .string({ error: 'FCM token is required!' })
      .min(1, { message: 'FCM token is required!' }),
  }),
});

// 18. appleSigninSchema — native-app (Expo) Sign in with Apple
// identityToken: the raw JWT from Apple's native SDK (required).
// fullName:  Apple sends this ONLY on the user's very first sign-in ever.
//            Optional at the API level — subsequent logins won't have it.
// fcmToken:  optional device push token for notification registration.
const appleSigninSchema = z.object({
  body: z.object({
    identityToken: z.string({
      error: 'Identity token is required!',
    }),
    fullName: z.string().optional(),
    fcmToken: z.string().min(1).optional(),
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
  fcmTokenSchema,
  appleSigninSchema,
};
