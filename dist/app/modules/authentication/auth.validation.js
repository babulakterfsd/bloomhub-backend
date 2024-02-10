"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.resetForgottenPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.loginSchema = exports.signupSchema = exports.shopkeeperSchema = void 0;
const zod_1 = require("zod");
exports.shopkeeperSchema = zod_1.z.object({
    name: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    email: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    isEmailVerified: zod_1.z.string({
        invalid_type_error: ' must be boolean',
        required_error: ' is required',
    }),
    password: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    role: zod_1.z.enum(['shopkeeper'], {
        invalid_type_error: ' must be "shopkeeper"',
        required_error: ' is required',
    }),
    lastTwoPasswords: zod_1.z
        .array(zod_1.z
        .object({
        oldPassword: zod_1.z
            .string({
            invalid_type_error: ' must be string',
            required_error: ' is required',
        })
            .optional(),
        changedAt: zod_1.z
            .date({
            invalid_type_error: ' must be a valid date',
            required_error: ' is required',
        })
            .optional(),
    })
        .optional())
        .optional(),
    profileImage: zod_1.z
        .string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    })
        .optional(),
    photos: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.signupSchema = zod_1.z.object({
    name: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    email: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    password: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    password: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    newPassword: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    shopkeeperEmail: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
});
exports.resetForgottenPasswordSchema = zod_1.z.object({
    shopkeeperEmail: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    newPassword: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z
        .string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    })
        .optional(),
    profileImage: zod_1.z
        .string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    })
        .optional(),
});
