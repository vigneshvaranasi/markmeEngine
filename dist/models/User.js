"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
exports.UserSchema = new mongoose_1.Schema({
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
        enum: ["Male", "Female"],
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
    lastOnline: {
        type: Date,
        default: Date.now()
    },
    createdOn: {
        type: Date,
        default: Date.now()
    },
    followingSpaces: [{
            type: mongoose_1.Types.ObjectId,
            ref: "Space"
        }],
    managingSpaces: [{
            type: mongoose_1.Types.ObjectId,
            ref: "Space"
        }],
    registeredEvents: [{
            type: mongoose_1.Types.ObjectId,
            ref: "Event"
        }],
    attendedEvents: [{
            type: mongoose_1.Types.ObjectId,
            ref: "Event"
        }],
    managingEvents: [{
            type: mongoose_1.Types.ObjectId,
            ref: "Event"
        }],
    notificationPreference: {
        type: Boolean,
        default: true
    }
});
exports.default = (0, mongoose_1.model)("User", exports.UserSchema);
