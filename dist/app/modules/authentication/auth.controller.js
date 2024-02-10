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
exports.ShopkeeperControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const auth_service_1 = require("./auth.service");
//create shopkeeper
const registerShopkeeper = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.ShopkeeperServices.registerShopkeeperInDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Shopkeeper has been registered succesfully',
        data: result,
    });
}));
//login shopkeeper
const loginShopkeeper = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.ShopkeeperServices.loginShopkeeperInDB(req.body);
    const { accesstoken, refreshfToken, shopkeeperFromDB } = result;
    res.cookie('refreshfToken', refreshfToken, {
        secure: config_1.default.NODE_ENV === 'production',
        httpOnly: true,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Shopkeeper has been logged in succesfully',
        data: {
            shopkeeper: {
                _id: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB._id,
                name: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.name,
                email: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.email,
                role: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.role,
            },
            token: accesstoken,
        },
    });
}));
// verify token from client side
const verifyToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.ShopkeeperServices.verifyToken(req.body.token);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Token verification completed!',
        data: result,
    });
}));
//get access token using refresh token
const getAccessTokenUsingRefreshToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield auth_service_1.ShopkeeperServices.getAccessTokenByRefreshToken((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshfToken);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Access token retrieved succesfully!',
        data: result,
    });
}));
//change password
const changePassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const passwordData = req.body;
    const token = (_b = req === null || req === void 0 ? void 0 : req.headers) === null || _b === void 0 ? void 0 : _b.authorization;
    const splittedToken = token === null || token === void 0 ? void 0 : token.split(' ')[1];
    const decodedShopkeeper = jsonwebtoken_1.default.verify(splittedToken, config_1.default.jwt_access_secret);
    const result = yield auth_service_1.ShopkeeperServices.changePasswordInDB(passwordData, decodedShopkeeper);
    const { statusCode, message } = result;
    if (statusCode === 406 && message === 'Recent password change detected.') {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.NOT_ACCEPTABLE,
            success: false,
            message: 'Recent password change detected.',
            data: null,
        });
    }
    else {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Password has been changed succesfully',
            data: result,
        });
    }
}));
//forgot password
const forgotPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shopkeeperEmail } = req.body;
    const result = yield auth_service_1.ShopkeeperServices.forgetPasswordInDB(shopkeeperEmail);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Password reset link has been sent to your email',
        data: result,
    });
}));
// reset forgotten password
const resetForgottenPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { newPassword, shopkeeperEmail } = req.body;
    let token = (_c = req === null || req === void 0 ? void 0 : req.headers) === null || _c === void 0 ? void 0 : _c.authorization;
    token = token === null || token === void 0 ? void 0 : token.split(' ')[1];
    const result = yield auth_service_1.ShopkeeperServices.resetForgottenPasswordInDB(shopkeeperEmail, token, newPassword);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Password has been reset succesfully',
        data: result,
    });
}));
// update shopkeeper profile
const updateShopkeeperProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const dataToBeUpdated = req.body;
    const token = (_d = req === null || req === void 0 ? void 0 : req.headers) === null || _d === void 0 ? void 0 : _d.authorization;
    const splittedToken = token === null || token === void 0 ? void 0 : token.split(' ')[1];
    const decodedShopkeeper = jsonwebtoken_1.default.verify(splittedToken, config_1.default.jwt_access_secret);
    const result = yield auth_service_1.ShopkeeperServices.updateShopkeeperProfileInDB(decodedShopkeeper, dataToBeUpdated);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Shopkeeper profile has been updated succesfully',
        data: result,
    });
}));
// get shopkeeper profile
const getShopkeeperProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const token = (_e = req === null || req === void 0 ? void 0 : req.headers) === null || _e === void 0 ? void 0 : _e.authorization;
    const splittedToken = token === null || token === void 0 ? void 0 : token.split(' ')[1];
    const decodedShopkeeper = jsonwebtoken_1.default.verify(splittedToken, config_1.default.jwt_access_secret);
    const { email } = decodedShopkeeper;
    const result = yield auth_service_1.ShopkeeperServices.getShopkeeperFromDbByEmail(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Shopkeeper profile has been retrieved succesfully',
        data: result,
    });
}));
exports.ShopkeeperControllers = {
    registerShopkeeper,
    loginShopkeeper,
    verifyToken,
    getAccessTokenUsingRefreshToken,
    changePassword,
    forgotPassword,
    resetForgottenPassword,
    updateShopkeeperProfile,
    getShopkeeperProfile,
};
