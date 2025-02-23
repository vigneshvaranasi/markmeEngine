"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaceSchema = void 0;
const mongoose_1 = require("mongoose");
exports.SpaceSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    followers: [{
            type: mongoose_1.Types.ObjectId,
            ref: "User"
        }],
    admins: [{
            type: mongoose_1.Types.ObjectId,
            ref: "User"
        }],
    events: [{
            type: mongoose_1.Types.ObjectId,
            ref: "Event"
        }],
    createdOn: {
        type: Date,
        default: Date.now()
    }
});
exports.default = (0, mongoose_1.model)("Space", exports.SpaceSchema);
