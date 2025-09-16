import mongoose, { Schema, Model } from "mongoose";
import { IPigeon } from "./pigeon.interface";
import { number, string } from "zod";

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
      required: true,   
     },
    birthYear: {
      type: Number,
      required: true,
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
    racingRating: { type: Number, default: 0 },
    breederRating: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      enum: ["Cock", "Hen", "Unknown"],
      default: "Unknown",
    },
    status: {
      type: String,
    },
    location: {
      type: String,
    },
    racerRating: {
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
    catagory: {
      type: String,
      default: "Other",
    },

    // only can field use admin 
    verified: {
      type: Boolean,
      default: false,
    },
    iconic: {
      type: Boolean,
      default: false,
    },
    iconicScore: {
      type: Number,
      default: 0,
    },
},
  {
    timestamps: true,
  }
);

export const Pigeon: Model<IPigeon> =
  mongoose.models.Pigeon || mongoose.model<IPigeon>("Pigeon", pigeonSchema);
