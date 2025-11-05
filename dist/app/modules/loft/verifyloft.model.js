"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loft = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const loftSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        //   required: true,
    },
    ringNumber: {
        type: String,
        // required: true,
        //   unique: true,
    },
    name: {
        type: String,
        //   unique: true,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Breeder",
        required: false,
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
        enum: ["Cock", "Hen", "Unspecified"],
        default: "Unspecified",
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
    eyePhoto: {
        type: String,
    },
    ownershipPhoto: {
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
            name: { type: String, },
            date: { type: Date, },
            distance: { type: String, },
            total: { type: Number, },
            place: { type: String, },
        },
    ],
    addresults: [
        {
            type: String,
        }
    ],
    fatherRingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Pigeon",
    },
    motherRingId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    remaining: [
        {
            type: String,
        },
    ]
}, {
    timestamps: true,
});
exports.Loft = mongoose_1.default.models.Loft || mongoose_1.default.model("Loft", loftSchema);
