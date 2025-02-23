"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpSchema = void 0;
const mongoose_1 = require("mongoose");
exports.OtpSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 600
    }
});
exports.default = (0, mongoose_1.model)('Otp', exports.OtpSchema);
