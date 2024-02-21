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
exports.ShopkeeperModel = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../../config"));
const shopkeeperSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: {
            validator: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },
            message: (props) => `${props.value} is not a valid email address`,
        },
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password should be at least 6 characters long'],
        validate: {
            validator: (value) => {
                // Password must contain at least one letter and one numeric character
                const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])/;
                return passwordRegex.test(value);
            },
            message: () => 'Password should contain at least one letter and one numeric character',
        },
    },
    role: {
        type: String,
        enum: {
            values: ['shopkeeper'],
            message: '{VALUE} is not a valid role. Only "shopkeeper" is allowed as role',
        },
        default: 'shopkeeper',
    },
    lastTwoPasswords: [
        {
            oldPassword: String,
            changedAt: Date,
        },
    ],
    profileImage: {
        type: String,
        default: '',
    },
    photos: [String],
    isEmailVerified: {
        type: String,
        required: [true, 'isEmailVerified is required'],
        default: 'false',
    },
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            delete ret.__v;
        },
    },
});
// hashing the password before saving it to the database
shopkeeperSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        this.password = yield bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
        next();
    });
});
// another layer of making sure that the password is not returned in the response
shopkeeperSchema.post('save', function (doc, next) {
    doc.password = '';
    next();
});
//custom static method to check if the shopkeeper exists or not
shopkeeperSchema.statics.isShopkeeperExistsWithEmail = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        const shopkepperFoundWithEmail = yield exports.ShopkeeperModel.findOne({ email });
        return shopkepperFoundWithEmail;
    });
};
exports.ShopkeeperModel = (0, mongoose_1.model)('shopkeepers', shopkeeperSchema);
