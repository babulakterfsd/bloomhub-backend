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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const dateFormater_1 = require("../../utils/dateFormater");
const product_model_1 = require("../product/product.model");
const sell_model_1 = require("./sell.model");
//create sell in DB
const createSellInDB = (sellsInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const productToBeSold = yield product_model_1.ProductModel.findById({
        _id: sellsInfo.productID,
    });
    if (!productToBeSold) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product does not exist');
    }
    else if ((productToBeSold === null || productToBeSold === void 0 ? void 0 : productToBeSold.quantity) < 1) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product not found');
    }
    else if ((sellsInfo === null || sellsInfo === void 0 ? void 0 : sellsInfo.quantityToBeSold) > (productToBeSold === null || productToBeSold === void 0 ? void 0 : productToBeSold.quantity)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Quantity should be equal or less than available quantity');
    }
    else if ((sellsInfo === null || sellsInfo === void 0 ? void 0 : sellsInfo.dateOfSell) > (0, dateFormater_1.getTodaysDate)()) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You cannot sell a product in the future!');
    }
    let result;
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        // transaction - 1
        result = yield sell_model_1.SellModel.create([sellsInfo], { session });
        // transaction - 2
        const reduceQuantityInProductCollection = yield product_model_1.ProductModel.findByIdAndUpdate({ _id: sellsInfo.productID }, { $inc: { quantity: -sellsInfo.quantityToBeSold } }, { session, new: true });
        if (!reduceQuantityInProductCollection) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to sell the product ');
        }
        yield session.commitTransaction();
        yield session.endSession();
        if (result.length < 1) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to sell the product ');
        }
        return result[0];
    }
    catch (err) {
        yield session.abortTransaction();
        yield session.endSession();
        throw new Error(err);
    }
});
// get all sells
const getAllSellsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, timeframe, shopkeepersEmail } = query;
    let startDate;
    //implement pagination
    const pageToBeFetched = Number(page) || 1;
    const limitToBeFetched = Number(limit) || 5;
    const skip = (pageToBeFetched - 1) * limitToBeFetched;
    // Calculate the start date based on the specified timeframe
    let weekAgo;
    let monthAgo;
    let yearAgo;
    switch (timeframe) {
        case 'daily':
            startDate = (0, dateFormater_1.getTodaysDate)();
            break;
        case 'weekly':
            weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            startDate = (0, dateFormater_1.getFormattedDate)(weekAgo);
            break;
        case 'monthly':
            monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            startDate = (0, dateFormater_1.getFormattedDate)(monthAgo);
            break;
        case 'yearly':
            yearAgo = new Date();
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            startDate = (0, dateFormater_1.getFormattedDate)(yearAgo);
            break;
        default:
            startDate = '1970-01-01';
    }
    const searchQuery = {
        dateOfSell: { $gte: startDate },
        sellerEmail: shopkeepersEmail,
    };
    // Query the database with the specified timeframe
    const soldProductList = yield sell_model_1.SellModel.find(searchQuery)
        .sort({
        createdAt: -1,
    })
        .skip(skip)
        .limit(limitToBeFetched);
    if (soldProductList.length < 1) {
        return {
            meta: {
                totalSellGenerated: 0,
                totalRevenue: 0,
                totalItemSold: 0,
            },
            soldProductList: [],
        };
    }
    else {
        let totalRevenue = 0;
        let totalItemSold = 0;
        const totalSellGenerated = yield sell_model_1.SellModel.countDocuments({
            dateOfSell: { $gte: startDate },
            sellerEmail: shopkeepersEmail,
        });
        soldProductList.forEach((curr) => {
            totalRevenue += curr.totalBill;
            totalItemSold += curr.quantityToBeSold;
        });
        const meta = {
            totalSellGenerated,
            totalRevenue,
            totalItemSold,
        };
        return {
            meta,
            soldProductList,
        };
    }
});
exports.SellServices = {
    createSellInDB,
    getAllSellsFromDB,
};
