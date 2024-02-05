import { z } from 'zod';

export const productSchema = z.object({
  name: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  price: z.number({
    invalid_type_error: ' must be number',
    required_error: ' is required',
  }),
  quantity: z.number({
    invalid_type_error: ' must be number',
    required_error: ' is required',
  }),
  bloomdate: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  discount: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  type: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  fragrance: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  colors: z.array(
    z.string({
      invalid_type_error: ' must be string',
      required_error: ' is required',
    }),
  ),
  sizes: z.array(
    z.string({
      invalid_type_error: ' must be string',
      required_error: ' is required',
    }),
  ),
  arrangementStyles: z.array(
    z.string({
      invalid_type_error: ' must be string',
      required_error: ' is required',
    }),
  ),
  occasions: z.array(
    z.string({
      invalid_type_error: ' must be string',
      required_error: ' is required',
    }),
  ),
  createdBy: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  creatorsEmail: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
});

export const productUpdateSchema = z.object({
  name: z
    .string({
      invalid_type_error: ' must be string',
      required_error: ' is required',
    })
    .optional(),
  price: z
    .number({
      invalid_type_error: ' must be number',
      required_error: ' is required',
    })
    .optional(),
  quantity: z
    .number({
      invalid_type_error: ' must be number',
      required_error: ' is required',
    })
    .optional(),
  bloomdate: z
    .string({
      invalid_type_error: ' must be string',
      required_error: ' is required',
    })
    .optional(),
  discount: z
    .string({
      invalid_type_error: ' must be string',
      required_error: ' is required',
    })
    .optional(),
  type: z
    .string({
      invalid_type_error: ' must be string',
      required_error: ' is required',
    })
    .optional(),
  fragrance: z
    .string({
      invalid_type_error: ' must be string',
      required_error: ' is required',
    })
    .optional(),
  colors: z
    .array(
      z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
      }),
    )
    .optional(),
  sizes: z
    .array(
      z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
      }),
    )
    .optional(),
  arrangementStyles: z
    .array(
      z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
      }),
    )
    .optional(),
  occasions: z
    .array(
      z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
      }),
    )
    .optional(),
});
