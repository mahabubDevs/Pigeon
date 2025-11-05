// import mongoose, { Schema, Model } from "mongoose";
// import { IPigeon } from "./pigeon.interface";
// import { number, string } from "zod";

// const pigeonSchema: Schema<IPigeon> = new Schema(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     ringNumber: {
//       type: String,
//       required: true,
//       // unique: true,
//     },
//     name: {
//       type: String,
//       // unique: true,
//     },
//     country: {
//       type: String,
//       required: false,   
//      },
//     birthYear: {
//       type: Number,
//       required: false,
//     },
//     shortInfo: {
//       type: String,
//     },
//     breeder: {
//       type: Schema.Types.ObjectId,
//       ref: "Breeder",
//       required: false,
//     },
//     color: {
//       type: String,
//     },
//     pattern: {
//       type: String,
//     },
//     racingRating: { type: Number, default: 0 },
//     breederRating: {
//       type: Number,
//       default: 0,
//     },
//     gender: {
//       type: String,
//       enum: ["Cock", "Hen", "Unspecified","N/A"],
//       default: "N/A",
//     },
//     status: {
//       type: String,
//     },
//     location: {
//       type: String,
//     },
//     racherRating: {
//       type: String,
      
//     },
//     notes: {
//       type: String,
//     },
//     photos: [
//       {
//         type: String, // photo URL store 
//       },
//     ],
//     pigeonPhoto: {
//       type: String,
//     },
//     eyePhoto:{
//       type: String,
//     },
//     ownershipPhoto:{
//       type: String,
//     },
//     pedigreePhoto: {
//       type: String,
//     },
//     DNAPhoto: {
//       type: String,
//     },
//     results: [
//       {
//         name: { type: String,  },
//         date: { type: Date,  },
//         distance: { type: String,},
//         total: { type: Number,  },
//         place: { type: String,},
//       },
//     ],
//     addresults: [
//       {
//       type: String,
//     }
//     ],
//     fatherRingId: {
//       type: Schema.Types.ObjectId,
//       ref: "Pigeon",
//     },
//     motherRingId: {
//       type: Schema.Types.ObjectId,
//       ref: "Pigeon",
//     },
//     catagory: {
//       type: String,
//       default: "Other",
//     },

//     // only can field use admin 
//     verified: {
//       type: Boolean,
//       default: false,
//     },
//     iconic: {
//       type: Boolean,
//       default: false,
//     },
//     iconicScore: {
//       type: Number,
//       default: 0,
//     },
//     remaining:[
//       {
//         type:String,
//       },
//     ]
// },
//   {
//     timestamps: true,
//   }
// );

// export const Pigeon: Model<IPigeon> =
//   mongoose.models.Pigeon || mongoose.model<IPigeon>("Pigeon", pigeonSchema);



import mongoose, { Schema, Model } from "mongoose";
import { IPigeon } from "./pigeon.interface";

const pigeonSchema: Schema<IPigeon> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // 🔹 pagination, filtering এর জন্য গুরুত্বপূর্ণ
    },
    ringNumber: {
      type: String,
      required: true,
      trim: true,
      index: true, // 🔹 searching/filtering এর জন্য দ্রুত
    },
    name: {
      type: String,
      trim: true,
      index: true,
    },
    country: {
      type: String,
      required: false,
      index: true, // 🔹 country অনুযায়ী filter করতে পারবে
    },
    birthYear: {
      type: Number,
      required: false,
      index: true,
    },
    shortInfo: { type: String },
    breeder: {
      type: Schema.Types.ObjectId,
      ref: "Breeder",
      required: false,
      index: true,
    },
    color: { type: String },
    pattern: { type: String },
    racingRating: { type: Number, default: 0 },
    breederRating: { type: Number, default: 0 },
    gender: {
      type: String,
      enum: ["Cock", "Hen", "Unspecified", "N/A"],
      default: "N/A",
      index: true,
    },
    status: { type: String, index: true },
    location: { type: String },
    racherRating: { type: String },
    notes: { type: String },
    photos: [{ type: String }],
    pigeonPhoto: { type: String },
    eyePhoto: { type: String },
    ownershipPhoto: { type: String },
    pedigreePhoto: { type: String },
    DNAPhoto: { type: String },
    results: [
      {
        name: { type: String },
        date: { type: Date },
        distance: { type: String },
        total: { type: Number },
        place: { type: String },
      },
    ],
    addresults: [{ type: String }],
    fatherRingId: {
      type: Schema.Types.ObjectId,
      ref: "Pigeon",
      index: true,
    },
    motherRingId: {
      type: Schema.Types.ObjectId,
      ref: "Pigeon",
      index: true,
    },
    catagory: {
      type: String,
      default: "Other",
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    iconic: {
      type: Boolean,
      default: false,
    },
    iconicScore: {
      type: Number,
      default: 0,
    },
    remaining: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// 🔹 Common compound indexes (pagination + search optimize)
pigeonSchema.index({ user: 1, createdAt: -1 });
pigeonSchema.index({ country: 1, birthYear: -1 });
pigeonSchema.index({ ringNumber: 1, country: 1, birthYear: 1 }, { unique: false });

export const Pigeon: Model<IPigeon> =
  mongoose.models.Pigeon || mongoose.model<IPigeon>("Pigeon", pigeonSchema);
