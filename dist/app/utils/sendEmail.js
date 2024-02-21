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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
/* ei nodemailer er setup local e khub shundor kaj kore, kntu vercel evabe mail sending support kore na ar, tai amar backend thikthak kaj korleo, shopkeeper er mail e mail jabe na. tao ei setup ta rakhlam karon kono paid hosting hole tkhn ei setup e aramche kaj korbe in sha allah.  */
const sendEmail = (to, html) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com.',
        port: 587,
        secure: config_1.default.NODE_ENV === 'production',
        auth: {
            user: 'fsd.whatislamsays@gmail.com',
            pass: config_1.default.email_app_password,
        },
    });
    yield transporter.sendMail({
        from: 'fsd.whatislamsays@gmail.com', // sender address
        to, // to whom email is to be sent
        subject: 'Bloomhub : Reset your password within 5 mins!', // Subject line
        text: 'test by awal', // plain text body
        html, // html body
    });
});
exports.sendEmail = sendEmail;
