"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userEmailSubscripton = void 0;
const mongoose_1 = require("mongoose");
const userEmailSubscriptonSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    unsubscribed: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });
exports.userEmailSubscripton = (0, mongoose_1.model)("userEmailSubscripton", userEmailSubscriptonSchema);
