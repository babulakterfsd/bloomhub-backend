"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productUpdateSchema = exports.productSchema = void 0;
const zod_1 = require("zod");
exports.productSchema = zod_1.z.object({
    name: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    price: zod_1.z.number({
        invalid_type_error: ' must be number',
        required_error: ' is required',
    }),
    quantity: zod_1.z.number({
        invalid_type_error: ' must be number',
        required_error: ' is required',
    }),
    bloomdate: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    discount: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    type: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    fragrance: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    colors: zod_1.z.array(zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    })),
    sizes: zod_1.z.array(zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    })),
    arrangementStyles: zod_1.z.array(zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    })),
    occasions: zod_1.z.array(zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    })),
    createdBy: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    creatorsEmail: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
});
exports.productUpdateSchema = zod_1.z.object({
    name: zod_1.z
        .string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    })
        .optional(),
    price: zod_1.z
        .number({
        invalid_type_error: ' must be number',
        required_error: ' is required',
    })
        .optional(),
    quantity: zod_1.z
        .number({
        invalid_type_error: ' must be number',
        required_error: ' is required',
    })
        .optional(),
    bloomdate: zod_1.z
        .string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    })
        .optional(),
    discount: zod_1.z
        .string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    })
        .optional(),
    type: zod_1.z
        .string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    })
        .optional(),
    fragrance: zod_1.z
        .string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    })
        .optional(),
    colors: zod_1.z
        .array(zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }))
        .optional(),
    sizes: zod_1.z
        .array(zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }))
        .optional(),
    arrangementStyles: zod_1.z
        .array(zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }))
        .optional(),
    occasions: zod_1.z
        .array(zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }))
        .optional(),
});
