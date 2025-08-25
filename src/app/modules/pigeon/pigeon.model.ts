import mongoose, { Schema, Model } from "mongoose";
import { IPigeon } from "./pigeon.interface";

const pigeonSchema: Schema<IPigeon> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ringNumber: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    country: {
      type: String,
    },
    birthYear: {
      type: Number,
    },
    shortInfo: {
      type: String,
    },
    breeder: {
      type: String,
    },
    color: {
      type: String,
    },
    pattern: {
      type: String,
    },
    racherRating: {
      type: Number,
      default: 0,
    },
    breederRating: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Unknown"],
      default: "Unknown",
    },
    status: {
      type: String,
    },
    location: {
      type: String,
    },
    racingRating: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
    photos: [
      {
        type: String, // photo URL store 
      },
    ],
    results: {
      type: String, // client text store
    },
    fatherRingId: {
      type: Schema.Types.ObjectId,
      ref: "Pigeon",
    },
    motherRingId: {
      type: Schema.Types.ObjectId,
      ref: "Pigeon",
    },
  },
  {
    timestamps: true,
  }
);

export const Pigeon: Model<IPigeon> =
  mongoose.models.Pigeon || mongoose.model<IPigeon>("Pigeon", pigeonSchema);
