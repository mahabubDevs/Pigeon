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
      required: false,   
     },
    birthYear: {
      type: Number,
      required: false,
    },
    shortInfo: {
      type: String,
    },
    breeder: {
      type: Schema.Types.ObjectId,
      ref: "Breeder",
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
    racherRating: {
      type: String,
      
    },
    notes: {
      type: String,
    },
    photos: [
      {
        type: String, // photo URL store 
      },
    ],
    pigeonPhoto: {
      type: String,
    },
    eyePhoto:{
      type: String,
    },
    ownershipPhoto:{
      type: String,
    },
    pedigreePhoto: {
      type: String,
    },
    DNAPhoto: {
      type: String,
    },
    results: [
      {
        name: { type: String,  },
        date: { type: Date,  },
        distance: { type: String,},
        total: { type: Number,  },
        place: { type: String,},
      },
    ],
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
    remaining:[
      {
        type:String,
      },
    ]
},
  {
    timestamps: true,
  }
);

export const Pigeon: Model<IPigeon> =
  mongoose.models.Pigeon || mongoose.model<IPigeon>("Pigeon", pigeonSchema);
