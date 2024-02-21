"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellSchema = void 0;
const zod_1 = require("zod");
exports.sellSchema = zod_1.z.object({
    productID: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    productName: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    productPrice: zod_1.z.number({
        invalid_type_error: ' must be number',
        required_error: ' is required',
    }),
    quantityToBeSold: zod_1.z.number({
        invalid_type_error: ' must be number',
        required_error: ' is required',
    }),
    buyerName: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    sellerEmail: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    dateOfSell: zod_1.z.string({
        invalid_type_error: ' must be string',
        required_error: ' is required',
    }),
    totalBill: zod_1.z.number({
        invalid_type_error: ' must be number',
        required_error: ' is required',
    }),
});
