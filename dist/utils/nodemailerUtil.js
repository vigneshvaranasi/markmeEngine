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
exports.sendOTP = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const default_1 = __importDefault(require("../configs/default"));
const { SENDGRID_API_KEY } = default_1.default;
mail_1.default.setApiKey(SENDGRID_API_KEY);
const sendOTP = (to, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const msg = {
        to,
        from: process.env.FROM_EMAIL || 'default@example.com',
        subject: 'Your OTP for Completing Registration',
        text: `OTP: ${otp}`
    };
    try {
        yield mail_1.default.send(msg);
        console.log(`Email sent to ${to}`);
    }
    catch (error) {
        console.error('Error sending email:', error);
    }
});
exports.sendOTP = sendOTP;
