// src/modules/breeder/breeder.model.ts
import mongoose, { Schema, Model } from "mongoose";
import { IBreeder } from "./breeder.interface";

const breederSchema = new Schema({
  loftName: { type: String, required: true },
  breederName: { type: String, required: true },
  country: { type: String },
  email: { type: String, required: false },
  phone: { type: String },
  status: { type: Boolean, default: false },
  experience: { type: String, default: "none" },
  score: { type: Number, default: 0 },
  gender: { type: String, enum: ["Hen", "Cock", "Other"], default: "Other" },
}, { timestamps: true });


export const Breeder: Model<IBreeder> =
  mongoose.models.Breeder || mongoose.model<IBreeder>("Breeder", breederSchema);
