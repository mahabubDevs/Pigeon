// src/modules/breeder/breeder.model.ts
import mongoose, { Schema, Model } from "mongoose";
import { IBreeder } from "./breeder.interface";

const breederSchema: Schema<IBreeder> = new Schema(
  {
    loftName: { type: String, required: true },
    breederName: { type: String, required: true },
    country: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    status: { type: Boolean, default: false },
    experience: { type: Number, default: 0 },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
  },
  { timestamps: true }
);

export const Breeder: Model<IBreeder> =
  mongoose.models.Breeder || mongoose.model<IBreeder>("Breeder", breederSchema);
