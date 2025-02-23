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
exports.deleteOTP = exports.getOTP = exports.createOTP = exports.createUser = exports.getUserByUsername = exports.getUserByEmail = exports.getUserById = void 0;
const User_1 = __importDefault(require("../models/User"));
const Otp_1 = __importDefault(require("../models/Otp"));
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({
            _id: id
        });
        return user;
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
exports.getUserById = getUserById;
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({
            email: email
        });
        return user;
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
exports.getUserByEmail = getUserByEmail;
const getUserByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({
            username: username
        });
        return user;
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
exports.getUserByUsername = getUserByUsername;
const createUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ username, email, password, profilePhoto, gender, fullname }) {
    try {
        const user = new User_1.default({
            username: username,
            email: email,
            password: password,
            profilePhoto: profilePhoto,
            gender: gender,
            fullname: fullname
        });
        yield user.save();
        return user;
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
exports.createUser = createUser;
const createOTP = (_a, otp_1) => __awaiter(void 0, [_a, otp_1], void 0, function* ({ username, email, password, profilePhoto, gender, fullname }, otp) {
    try {
        const newOTP = new Otp_1.default({
            username: username,
            fullname: fullname,
            email: email,
            password: password,
            profilePhoto: profilePhoto,
            gender: gender,
            otp: otp
        });
        yield newOTP.save();
        return newOTP;
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
exports.createOTP = createOTP;
const getOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingOTP = yield Otp_1.default.findOne({
            email: email,
            otp: otp
        });
        console.log('existingOTP: ', existingOTP);
        return existingOTP;
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
exports.getOTP = getOTP;
const deleteOTP = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Otp_1.default.deleteOne({
            email: email
        });
    }
    catch (err) {
        console.error(err);
    }
});
exports.deleteOTP = deleteOTP;
