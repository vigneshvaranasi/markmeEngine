"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSchema = void 0;
const mongoose_1 = require("mongoose");
exports.EventSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    managers: [{
            type: mongoose_1.Types.ObjectId,
            ref: "User"
        }],
    timings: {
        type: {
            start: Date,
            end: Date
        },
        required: true,
    },
    status: {
        type: String,
        enum: ["Upcoming", "Live", "Hold", "Ongoing", "Archived"],
        required: true
    },
    attendees: [{
            type: mongoose_1.Types.ObjectId,
            ref: "User"
        }],
    description: {
        type: {
            description: String,
            guidelines: String
        },
    },
    venue: {
        type: {
            name: String,
            address: String,
        },
    },
    visibility: {
        type: String,
        enum: ["Public", "Private"],
        required: true,
        default: "Public"
    },
    poster: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
    },
    contactDetails: [{
            type: {
                name: String,
                phone: String,
                email: String(10)
            }
        }],
    hosts: [{
            type: mongoose_1.Types.ObjectId,
            ref: "User"
        }],
    checkedIn: [{
            type: mongoose_1.Types.ObjectId,
            ref: "User"
        }],
    feedbackURL: {
        type: String,
    }
});
exports.default = (0, mongoose_1.model)("Event", exports.EventSchema);
