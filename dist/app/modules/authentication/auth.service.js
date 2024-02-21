"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.ShopkeeperServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unsafe-optional-chaining */
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sendEmail_1 = require("../../utils/sendEmail");
const auth_model_1 = require("./auth.model");
//create shopkeeper in DB
const registerShopkeeperInDB = (shopkeeper) => __awaiter(void 0, void 0, void 0, function* () {
    const isShopkeeperExistsWithEmail = yield auth_model_1.ShopkeeperModel.isShopkeeperExistsWithEmail(shopkeeper === null || shopkeeper === void 0 ? void 0 : shopkeeper.email);
    if (isShopkeeperExistsWithEmail) {
        throw new Error('Shopkeeper with this email already exists, please try with different  email.');
    }
    else {
        const session = yield mongoose_1.default.startSession();
        try {
            session.startTransaction();
            // transaction - 1
            const newShopkeeper = yield auth_model_1.ShopkeeperModel.create([shopkeeper], {
                session,
            });
            yield session.commitTransaction();
            yield session.endSession();
            if (newShopkeeper.length < 1) {
                throw new Error('Shopkeeper registration failed');
            }
            return newShopkeeper[0];
        }
        catch (err) {
            yield session.abortTransaction();
            yield session.endSession();
            throw new Error(err);
        }
    }
});
// login shopkeeper in DB
const loginShopkeeperInDB = (shopkeeper) => __awaiter(void 0, void 0, void 0, function* () {
    const shopkeeperFromDB = yield auth_model_1.ShopkeeperModel.isShopkeeperExistsWithEmail(shopkeeper === null || shopkeeper === void 0 ? void 0 : shopkeeper.email);
    if (!shopkeeperFromDB) {
        throw new Error('No shopkeeper found with this email');
    }
    const isPasswordMatched = yield bcrypt_1.default.compare(shopkeeper === null || shopkeeper === void 0 ? void 0 : shopkeeper.password, shopkeeperFromDB.password);
    if (!isPasswordMatched) {
        throw new Error('Incorrect password');
    }
    //create token and send it to client side
    const payload = {
        _id: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB._id,
        name: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.name,
        email: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.email,
        role: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.role,
    };
    const accesstoken = jsonwebtoken_1.default.sign(payload, config_1.default.jwt_access_secret, {
        expiresIn: config_1.default.jwt_access_expires_in,
    });
    const refreshfToken = jsonwebtoken_1.default.sign(payload, config_1.default.jwt_refresh_secret, {
        expiresIn: config_1.default.jwt_refresh_expires_in,
    });
    return {
        accesstoken,
        refreshfToken,
        shopkeeperFromDB,
    };
});
//verify token from client side
const verifyToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        return false;
    }
    // checking token is valid or not
    let decodedShopkeeper;
    try {
        decodedShopkeeper = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
    }
    catch (error) {
        return false;
    }
    const { email } = decodedShopkeeper;
    // checking if the shopkeeper exists
    const shopkeeper = yield auth_model_1.ShopkeeperModel.isShopkeeperExistsWithEmail(email);
    if (!shopkeeper) {
        return false;
    }
    return true;
});
//generate refresh token
const getAccessTokenByRefreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Refresh token is required');
    }
    // checking token is valid or not
    let decodedShopkeeper;
    try {
        decodedShopkeeper = jsonwebtoken_1.default.verify(token, config_1.default.jwt_refresh_secret);
    }
    catch (error) {
        throw new jsonwebtoken_1.JsonWebTokenError('Unauthorized Access!');
    }
    const { _id, name, role, email } = decodedShopkeeper;
    // checking if the shopkeeper exists
    const shopkeeper = yield auth_model_1.ShopkeeperModel.isShopkeeperExistsWithEmail(email);
    if (!shopkeeper) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Unauthorized Access!');
    }
    const payload = {
        _id,
        name,
        role,
        email,
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, config_1.default.jwt_access_secret, {
        expiresIn: config_1.default.jwt_access_expires_in,
    });
    return {
        accessToken,
    };
});
// change password
const changePasswordInDB = (passwordData, shopkeeper) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const { currentPassword, newPassword } = passwordData;
    // check if the shopkeeper exists in the database
    const shopkeeperFromDB = yield auth_model_1.ShopkeeperModel.findOne({
        email: shopkeeper === null || shopkeeper === void 0 ? void 0 : shopkeeper.email,
    });
    if (!shopkeeperFromDB) {
        throw new jsonwebtoken_1.JsonWebTokenError('Unauthorized Access!');
    }
    if ((shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.email) === 'xpawal@gmail.com') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password change is not allowed for this demo account');
    }
    const currentAccesstokenIssuedAt = (shopkeeper === null || shopkeeper === void 0 ? void 0 : shopkeeper.iat) * 1000;
    let lastPasswordChangedAt = ((_b = (_a = shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.lastTwoPasswords) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.changedAt)
        ? (_d = (_c = shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.lastTwoPasswords) === null || _c === void 0 ? void 0 : _c[1]) === null || _d === void 0 ? void 0 : _d.changedAt
        : (_f = (_e = shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.lastTwoPasswords) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.changedAt;
    //convert lastPasswordChangedAt to miliseconds
    lastPasswordChangedAt = new Date(lastPasswordChangedAt).getTime();
    if (((_g = shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.lastTwoPasswords) === null || _g === void 0 ? void 0 : _g.length) === 0) {
        lastPasswordChangedAt = (shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.createdAt).getTime();
    }
    if (currentAccesstokenIssuedAt < lastPasswordChangedAt) {
        // throw new JsonWebTokenError('Unauthorized Access!');
        return {
            statusCode: 406,
            status: 'failed',
            message: 'Recent password change detected.',
        };
    }
    // check if the current password the shopkeeper gave is correct
    const isPasswordMatched = yield bcrypt_1.default.compare(currentPassword, shopkeeperFromDB.password);
    if (!isPasswordMatched) {
        throw new Error('Current password does not match');
    }
    // Check if new password is the same as the current one
    const isSameAsCurrent = currentPassword === newPassword;
    if (isSameAsCurrent) {
        throw new Error('New password must be different from the current password');
    }
    // Check if the new password is the same as the last two passwords
    const isSameAsLastTwoPasswords = (_h = shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.lastTwoPasswords) === null || _h === void 0 ? void 0 : _h.some((password) => {
        return bcrypt_1.default.compareSync(newPassword, password.oldPassword);
    });
    if (isSameAsLastTwoPasswords) {
        const lastUsedDate = (_k = (_j = shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.lastTwoPasswords) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.changedAt;
        const formattedLastUsedDate = lastUsedDate
            ? new Date(lastUsedDate).toLocaleString()
            : 'unknown';
        throw new Error(`Password change failed. Ensure the new password is unique and not among the last 2 used (last used on ${formattedLastUsedDate}).`);
    }
    // Check if the new password meets the minimum requirements
    if (newPassword.length < 6 || !/\d/.test(newPassword)) {
        throw new Error('New password must be minimum 6 characters and include both letters and numbers');
    }
    // Update the password and keep track of the last two passwords
    const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, 12);
    const newLastTwoPasswords = () => {
        var _a, _b, _c;
        if (((_a = shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.lastTwoPasswords) === null || _a === void 0 ? void 0 : _a.length) === 0) {
            return [
                { oldPassword: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.password, changedAt: new Date() },
            ];
        }
        else if (((_b = shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.lastTwoPasswords) === null || _b === void 0 ? void 0 : _b.length) === 1) {
            return [
                ...shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.lastTwoPasswords,
                { oldPassword: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.password, changedAt: new Date() },
            ];
        }
        else if (((_c = shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.lastTwoPasswords) === null || _c === void 0 ? void 0 : _c.length) === 2) {
            return [
                shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.lastTwoPasswords[1],
                { oldPassword: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.password, changedAt: new Date() },
            ];
        }
    };
    const result = yield auth_model_1.ShopkeeperModel.findOneAndUpdate({ email: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.email }, {
        password: hashedNewPassword,
        lastTwoPasswords: newLastTwoPasswords(),
    }, {
        new: true,
    });
    if (!result) {
        throw new Error('Password change failed');
    }
    const modifiedResult = {
        _id: result === null || result === void 0 ? void 0 : result._id,
        name: result === null || result === void 0 ? void 0 : result.name,
        email: result === null || result === void 0 ? void 0 : result.email,
        role: result === null || result === void 0 ? void 0 : result.role,
    };
    return modifiedResult;
});
//forgot password
const forgetPasswordInDB = (shopkeeperEmail) => __awaiter(void 0, void 0, void 0, function* () {
    if (!shopkeeperEmail) {
        throw new Error('Invalid email');
    }
    const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(shopkeeperEmail)) {
        throw new Error('Invalid email format');
    }
    if (shopkeeperEmail === 'xpawal@gmail.com') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password reset is not allowed for this demo account');
    }
    const shopkeeperFromDB = yield auth_model_1.ShopkeeperModel.findOne({
        email: shopkeeperEmail,
    });
    if (!shopkeeperFromDB) {
        throw new Error('No account found with that email');
    }
    const payload = {
        email: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.email,
    };
    const resettoken = jsonwebtoken_1.default.sign(payload, config_1.default.jwt_access_secret, {
        expiresIn: '5m',
    });
    const resetUrl = `${config_1.default.client_url}/forgot-password?email=${shopkeeperEmail}&token=${resettoken}`;
    (0, sendEmail_1.sendEmail)(shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.email, `<p>Click <a href="${resetUrl}" target="_blank">here</a> to reset your password</p> . <br/> <p>If you didn't request a password reset, please ignore this email.After 5 mins, the link will be invalid</p>`);
    return null;
});
// reset forgotten password
const resetForgottenPasswordInDB = (shopkeeperEmail, resetToken, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    if (!shopkeeperEmail || !resetToken || !newPassword) {
        throw new Error('Invalid data');
    }
    else if (newPassword.length < 6 || !/\d/.test(newPassword)) {
        throw new Error('New password must be minimum 6 characters and include both letters and numbers');
    }
    else if (shopkeeperEmail === 'xpawal@gmail.com') {
        throw new Error('Password reset is not allowed for this demo account');
    }
    const shopkeeperFromDB = yield auth_model_1.ShopkeeperModel.findOne({
        email: shopkeeperEmail,
    });
    if (!shopkeeperFromDB) {
        throw new Error('No account found with that email');
    }
    else {
        // checking token is valid or not
        let decodedShopkeeper;
        try {
            decodedShopkeeper = jsonwebtoken_1.default.verify(resetToken, config_1.default.jwt_access_secret);
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
        if (decodedShopkeeper.email !== shopkeeperEmail) {
            throw new Error('Invalid token');
        }
        const shopkeeperFromDB = yield auth_model_1.ShopkeeperModel.findOne({
            email: shopkeeperEmail,
        });
        if (!shopkeeperFromDB) {
            throw new Error('No account found with that email while resetting password');
        }
        const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, Number(config_1.default.bcrypt_salt_rounds));
        const result = yield auth_model_1.ShopkeeperModel.findOneAndUpdate({ email: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.email }, {
            password: hashedNewPassword,
        }, {
            new: true,
        });
        if (!result) {
            throw new Error('Password reset failed');
        }
        const modifiedResult = {
            _id: result === null || result === void 0 ? void 0 : result._id,
            name: result === null || result === void 0 ? void 0 : result.name,
            email: result === null || result === void 0 ? void 0 : result.email,
            role: result === null || result === void 0 ? void 0 : result.role,
        };
        return modifiedResult;
    }
});
//update shopkeeper profile
const updateShopkeeperProfileInDB = (shopkeeper, dataToBeUpdated) => __awaiter(void 0, void 0, void 0, function* () {
    const shopkeeperFromDB = yield auth_model_1.ShopkeeperModel.findOne({
        email: shopkeeper === null || shopkeeper === void 0 ? void 0 : shopkeeper.email,
    });
    if (!shopkeeperFromDB) {
        throw new jsonwebtoken_1.JsonWebTokenError('Unauthorized Access!');
    }
    const { name, profileImage } = dataToBeUpdated;
    let existingPhotos = shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.photos;
    if (profileImage) {
        if (existingPhotos === null || existingPhotos === void 0 ? void 0 : existingPhotos.includes(profileImage)) {
            existingPhotos = shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.photos;
        }
        else {
            existingPhotos = [...existingPhotos, profileImage];
        }
    }
    const result = yield auth_model_1.ShopkeeperModel.findOneAndUpdate({ email: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.email }, {
        name: name ? name : shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.name,
        profileImage: profileImage
            ? profileImage
            : shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.profileImage,
        photos: existingPhotos,
    }, {
        new: true,
    });
    if (!result) {
        throw new Error('Update failed');
    }
    const modifiedResult = {
        _id: result === null || result === void 0 ? void 0 : result._id,
        name: result === null || result === void 0 ? void 0 : result.name,
        email: result === null || result === void 0 ? void 0 : result.email,
        role: result === null || result === void 0 ? void 0 : result.role,
        profileImage: result === null || result === void 0 ? void 0 : result.profileImage,
    };
    return modifiedResult;
});
// delete a photo from shopkeeper profile
const deleteAPhotoFromShopkeeperProfileInDB = (shopkeeper, photoUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const shopkeeperFromDB = yield auth_model_1.ShopkeeperModel.findOne({
        email: shopkeeper === null || shopkeeper === void 0 ? void 0 : shopkeeper.email,
    });
    if (!shopkeeperFromDB) {
        throw new jsonwebtoken_1.JsonWebTokenError('Unauthorized Access!');
    }
    const existingPhotos = shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.photos;
    const updatedPhotos = existingPhotos.filter((photo) => photo !== photoUrl);
    const result = yield auth_model_1.ShopkeeperModel.findOneAndUpdate({ email: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.email }, {
        photos: updatedPhotos,
    }, {
        new: true,
    });
    if (!result) {
        throw new Error('Failed to delete photo');
    }
    const modifiedResult = {
        _id: result === null || result === void 0 ? void 0 : result._id,
        name: result === null || result === void 0 ? void 0 : result.name,
        email: result === null || result === void 0 ? void 0 : result.email,
        role: result === null || result === void 0 ? void 0 : result.role,
        profileImage: result === null || result === void 0 ? void 0 : result.profileImage,
    };
    return modifiedResult;
});
// get shopkeeper by email
const getShopkeeperFromDbByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new Error('Email is required');
    }
    else {
        const shopkeeperFromDB = yield auth_model_1.ShopkeeperModel.findOne({
            email,
        });
        const modifiedShopkeeper = {
            _id: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB._id,
            name: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.name,
            email: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.email,
            role: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.role,
            profileImage: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.profileImage,
            isEmailVerified: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.isEmailVerified,
            photos: shopkeeperFromDB === null || shopkeeperFromDB === void 0 ? void 0 : shopkeeperFromDB.photos,
        };
        return modifiedShopkeeper;
    }
});
exports.ShopkeeperServices = {
    registerShopkeeperInDB,
    loginShopkeeperInDB,
    verifyToken,
    getAccessTokenByRefreshToken,
    changePasswordInDB,
    forgetPasswordInDB,
    resetForgottenPasswordInDB,
    updateShopkeeperProfileInDB,
    deleteAPhotoFromShopkeeperProfileInDB,
    getShopkeeperFromDbByEmail,
};
