import { z } from 'zod';

export const shopkeeperSchema = z.object({
  name: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  email: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  isEmailVerified: z.string({
    invalid_type_error: ' must be boolean',
    required_error: ' is required',
  }),
  password: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  role: z.enum(['shopkeeper'], {
    invalid_type_error: ' must be "shopkeeper"',
    required_error: ' is required',
  }),
  lastTwoPasswords: z
    .array(
      z
        .object({
          oldPassword: z
            .string({
              invalid_type_error: ' must be string',
              required_error: ' is required',
            })
            .optional(),
          changedAt: z
            .date({
              invalid_type_error: ' must be a valid date',
              required_error: ' is required',
            })
            .optional(),
        })
        .optional(),
    )
    .optional(),
  profileImage: z
    .string({
      invalid_type_error: ' must be string',
      required_error: ' is required',
    })
    .optional(),
  photos: z.array(z.string()).optional(),
});

export const signupSchema = z.object({
  name: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  email: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  password: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
});

export const loginSchema = z.object({
  email: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  password: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  newPassword: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
});

export const forgotPasswordSchema = z.object({
  shopkeeperEmail: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
});

export const resetForgottenPasswordSchema = z.object({
  shopkeeperEmail: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  newPassword: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
});

export const updateProfileSchema = z.object({
  name: z
    .string({
      invalid_type_error: ' must be string',
      required_error: ' is required',
    })
    .optional(),
  profileImage: z
    .string({
      invalid_type_error: ' must be string',
      required_error: ' is required',
    })
    .optional(),
});
