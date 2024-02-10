"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellModel = void 0;
const mongoose_1 = require("mongoose");
const sellSchema = new mongoose_1.Schema({
    productID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    productPrice: {
        type: Number,
        required: true,
    },
    quantityToBeSold: {
        type: Number,
        required: true,
    },
    buyerName: {
        type: String,
        required: true,
    },
    sellerEmail: {
        type: String,
        required: true,
    },
    dateOfSell: {
        type: String,
        required: true,
    },
    totalBill: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});
exports.SellModel = (0, mongoose_1.model)('sells', sellSchema);
