"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 1,
    },
    quantity: {
        type: Number,
        required: true,
    },
    bloomdate: {
        type: String,
        required: true,
    },
    discount: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    fragrance: {
        type: String,
        required: true,
    },
    colors: {
        type: [String],
        required: true,
    },
    sizes: {
        type: [String],
        required: true,
    },
    arrangementStyles: {
        type: [String],
        required: true,
    },
    occasions: {
        type: [String],
        required: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'shopkeepers',
        required: true,
    },
    creatorsEmail: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
//checking if the product really exists or not with the same name
productSchema.statics.isProductExistsWithSameName = function (productName) {
    return __awaiter(this, void 0, void 0, function* () {
        const product = yield this.findOne({ name: productName });
        return !!product;
    });
};
exports.ProductModel = (0, mongoose_1.model)('products', productSchema);
