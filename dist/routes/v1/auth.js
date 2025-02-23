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
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailerUtil_1 = require("../../utils/nodemailerUtil");
const dbUtils_1 = require("../../utils/dbUtils");
const AuthRouter = (0, express_1.Router)();
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
AuthRouter.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const RegisterData = req.body;
        // Validating Request Body
        if (RegisterData.email === undefined ||
            RegisterData.password === undefined ||
            RegisterData.fullname === undefined ||
            RegisterData.gender === undefined ||
            RegisterData.profilePhoto === undefined ||
            RegisterData.username === undefined) {
            res.status(400).send({
                message: 'Please Provide All Required Fields',
                error: true
            });
            return;
        }
        // Checking if User Already Exists
        const user = yield (0, dbUtils_1.getUserByEmail)(RegisterData.email);
        if (user) {
            res.status(400).send({
                message: 'User Already Exists',
                error: true
            });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(RegisterData.password, 10);
        // OTP Generation and Sending
        const otp = generateOTP();
        const NewUser = {
            username: RegisterData.username,
            email: RegisterData.email,
            password: hashedPassword,
            fullname: RegisterData.fullname,
            profilePhoto: RegisterData.profilePhoto,
            gender: RegisterData.gender
        };
        const optSent = yield (0, dbUtils_1.createOTP)(NewUser, otp);
        yield (0, nodemailerUtil_1.sendOTP)(RegisterData.email, otp);
        res.status(200).send({
            message: 'OTP Sent Successfully',
            error: false
        });
    }
    catch (err) {
        console.error('Registration Failed!', err);
        res.status(500).send({
            message: 'Registration Failed, Please Try Later',
            error: true
        });
    }
}));
AuthRouter.get('/checkUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Checking if User Already Exists
    const username = req.body.username;
    const user = yield (0, dbUtils_1.getUserByUsername)(username);
    if (user) {
        res.status(400).send({
            message: 'User Already Exists',
            error: true
        });
        return;
    }
    res.status(200).send({
        message: 'User Does Not Exists',
        error: false
    });
}));
AuthRouter.post('/verifyOtp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        if (email === undefined || otp === undefined) {
            res.status(400).send({
                message: 'Please Provide All Required Fields',
                error: true
            });
            return;
        }
        console.log('email: ', email);
        console.log('otp: ', otp);
        const user = yield (0, dbUtils_1.getOTP)(email.toString(), otp.toString());
        console.log('user: ', user);
        if (!user) {
            res.send({
                message: 'Invalid OTP',
                error: true
            });
            return;
        }
        const verifiedUser = {
            username: user.username,
            email: user.email,
            password: user.password,
            fullname: user.fullname,
            profilePhoto: user.profilePhoto,
            gender: user.gender
        };
        yield (0, dbUtils_1.createUser)(verifiedUser);
        yield (0, dbUtils_1.deleteOTP)(email.toString());
        res.status(200).send({
            message: 'OTP Verified Successfully',
            error: false
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send({
            message: 'OTP Verification Failed',
            error: true
        });
    }
}));
exports.default = AuthRouter;
