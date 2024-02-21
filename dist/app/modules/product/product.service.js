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
exports.ProductServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const product_model_1 = require("./product.model");
//create product in DB
const createProductInDB = (product) => __awaiter(void 0, void 0, void 0, function* () {
    if ((product === null || product === void 0 ? void 0 : product.quantity) < 1) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Quantity should be equal or greater than 1');
    }
    else if ((product === null || product === void 0 ? void 0 : product.price) < 1) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Price should be equal or greater than 1');
    }
    const result = yield product_model_1.ProductModel.create(product);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create course');
    }
    else {
        return result;
    }
});
//get all products from DB
const getAllProductsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, shopkeepersEmail, search, sortBy, sortOrder, minPrice, maxPrice, bloomDateFrom, bloomDateTo, color, type, size, fragrance, arrangementStyle, occasion, } = query;
    const totalDocs = yield product_model_1.ProductModel.countDocuments({
        creatorsEmail: shopkeepersEmail,
    });
    const meta = {
        page: Number(page) || 1,
        limit: Number(limit) || 5,
        total: totalDocs,
    };
    //implement pagination
    const pageToBeFetched = Number(page) || 1;
    const limitToBeFetched = Number(limit) || 5;
    const skip = (pageToBeFetched - 1) * limitToBeFetched;
    //sort
    const sortCheck = {};
    if (sortBy && ['price', 'quantity'].includes(sortBy)) {
        sortCheck[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }
    // filter
    const filter = {};
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) {
            filter.price.$gte = Number(minPrice);
        }
        if (maxPrice) {
            filter.price.$lte = Number(maxPrice);
        }
    }
    if (color) {
        filter.colors = new RegExp(color, 'i');
    }
    if (bloomDateFrom || bloomDateTo) {
        filter.bloomdate = {};
        if (bloomDateFrom) {
            filter.bloomdate.$gte = bloomDateFrom;
        }
        if (bloomDateTo) {
            filter.bloomdate.$lte = bloomDateTo;
        }
    }
    if (type) {
        filter.type = new RegExp(type, 'i');
    }
    if (size) {
        filter.sizes = new RegExp(size, 'i');
    }
    if (fragrance) {
        filter.fragrance = new RegExp(fragrance, 'i');
    }
    if (arrangementStyle) {
        filter.arrangementStyles = new RegExp(arrangementStyle, 'i');
    }
    if (occasion) {
        filter.occasions = new RegExp(occasion, 'i');
    }
    if (shopkeepersEmail) {
        filter.creatorsEmail = shopkeepersEmail;
    }
    if (search) {
        filter.$or = [
            { name: new RegExp(search, 'i') },
            { type: new RegExp(search, 'i') },
        ];
    }
    filter.quantity = { $gte: 1 };
    //fetch products
    const result = yield product_model_1.ProductModel.find(filter)
        // .sort(sortCheck)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitToBeFetched);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to get courses');
    }
    else {
        return {
            meta,
            data: result,
        };
    }
});
//get single product from DB
const getSingleProductFromDB = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    const isProductExists = yield product_model_1.ProductModel.findById({ _id: productId });
    if (!isProductExists) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product does not exist');
    }
    const product = yield product_model_1.ProductModel.findById({ _id: productId });
    if (!product || (product === null || product === void 0 ? void 0 : product.quantity) < 1) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product not found');
    }
    return product;
});
//update a product in DB
const updateAProductInDB = (productId, updatedProductData) => __awaiter(void 0, void 0, void 0, function* () {
    const productExists = yield product_model_1.ProductModel.findById({ _id: productId });
    if (!productExists) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'ProductId does not exist');
    }
    if ((updatedProductData === null || updatedProductData === void 0 ? void 0 : updatedProductData.quantity) < 1) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Quantity should be equal or greater than 1');
    }
    else if ((updatedProductData === null || updatedProductData === void 0 ? void 0 : updatedProductData.price) < 1) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Price should be equal or greater than 1');
    }
    const result = yield product_model_1.ProductModel.findByIdAndUpdate({ _id: productId }, updatedProductData, { new: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update product');
    }
    else {
        return result;
    }
});
//delete a product from DB
const deleteAProductFromDB = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    const productExists = yield product_model_1.ProductModel.findById({ _id: productId });
    if (!productExists) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'ProductId does not exist');
    }
    const result = yield product_model_1.ProductModel.findByIdAndDelete({ _id: productId });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete product');
    }
    else {
        return result;
    }
});
// delete multiple products
const deleteMultipleProducts = (productIds) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_model_1.ProductModel.deleteMany({ _id: { $in: productIds } });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete products');
    }
    else {
        return result;
    }
});
exports.ProductServices = {
    createProductInDB,
    getAllProductsFromDB,
    getSingleProductFromDB,
    updateAProductInDB,
    deleteAProductFromDB,
    deleteMultipleProducts,
};
