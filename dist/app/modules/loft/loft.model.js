"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLoft = void 0;
const mongoose_1 = require("mongoose");
// import { ILoft } from "./loft.interface";
const userLoftSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    pigeon: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Pigeon",
        required: true,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
// prevent same pigeon multiple times in same user loft
userLoftSchema.index({ user: 1, pigeon: 1 }, { unique: true });
exports.UserLoft = (0, mongoose_1.model)("UserLoft", userLoftSchema);
// const loftSchema = new Schema<ILoft>({
//   loftName: { type: String, required: true },
//   breeder: { type: Schema.Types.ObjectId, ref: "Breeder", required: false },
//   country: { type: String },
//   status: { type: Boolean, default: false }, // verified or not
// }, { timestamps: true });
// export const Loft: Model<ILoft> = mongoose.models.Loft || mongoose.model<ILoft>("Loft", loftSchema);
