"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePigeonZodSchema = exports.createPigeonZodSchema = void 0;
const zod_1 = require("zod");
// Race result object schema
const raceResultSchema = zod_1.z.object({
    name: zod_1.z.string({ required_error: "Race name is required" }),
    date: zod_1.z.preprocess(val => (val ? new Date(val) : undefined), zod_1.z.date({ required_error: "Race date is required" })),
    distance: zod_1.z.string({ required_error: "Distance is required" }),
    total: zod_1.z.number({ required_error: "Total is required" }).int(),
    place: zod_1.z.string({ required_error: "Place is required" }),
});
exports.createPigeonZodSchema = zod_1.z.object({
    ringNumber: zod_1.z.string({ required_error: "Ring Number is required" }),
    name: zod_1.z.string({ required_error: "Name is required" }),
    country: zod_1.z.string({ required_error: "Country is required" }),
    birthYear: zod_1.z.preprocess(val => (val !== undefined && val !== "" ? Number(val) : undefined), zod_1.z.number({ required_error: "Birth Year is required" })
        .int()
        .min(1900)
        .max(new Date().getFullYear())),
    shortInfo: zod_1.z.string({ required_error: "Short Info is required" }),
    breeder: zod_1.z.string({ required_error: "Breeder is required" }),
    color: zod_1.z.string({ required_error: "Color is required" }),
    pattern: zod_1.z.string().optional(),
    // racherRating: z.preprocess(
    //   val => (val !== undefined && val !== "" ? Number(val) : undefined),
    //   z.number({ required_error: "Racher Rating is required" }).min(0).max(100)
    // ),
    racherRating: zod_1.z.string().optional(),
    breederRating: zod_1.z.preprocess(val => (val !== undefined && val !== "" ? Number(val) : undefined), zod_1.z.number({ required_error: "Breeder Rating is required" }).min(0).max(100)),
    racingRating: zod_1.z.number().optional(),
    gender: zod_1.z.enum(["Cock", "Hen", "Unknown"], { required_error: "Gender is required" }),
    status: zod_1.z.string({ required_error: "Status is required" }),
    location: zod_1.z.string({ required_error: "Location is required" }),
    verified: zod_1.z.boolean().optional(), // Admin can set
    iconic: zod_1.z.boolean().optional(), // Admin can set
    iconicScore: zod_1.z.number().optional(), // Admin can set
    notes: zod_1.z.string().optional(),
    photos: zod_1.z.array(zod_1.z.string()).min(1, "At least one photo is required"),
    results: zod_1.z
        .preprocess((val) => {
        if (!val)
            return undefined; // results না দিলে optional
        if (typeof val === "string") {
            try {
                return JSON.parse(val); // string → array of objects
            }
            catch (_a) {
                return [];
            }
        }
        return val;
    }, zod_1.z.array(raceResultSchema).nonempty({ message: "Results objects are required if results is provided" }))
        .optional(),
    fatherRingId: zod_1.z.string().optional(),
    motherRingId: zod_1.z.string().optional(),
});
exports.updatePigeonZodSchema = zod_1.z.object({
    ringNumber: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    birthYear: zod_1.z.preprocess(val => (val !== undefined && val !== "" ? Number(val) : undefined), zod_1.z.number().int().min(1900).max(new Date().getFullYear()).optional()),
    shortInfo: zod_1.z.string().optional(),
    breeder: zod_1.z.string().optional(),
    color: zod_1.z.string().optional(),
    pattern: zod_1.z.string().optional(),
    racherRating: zod_1.z.string().optional(),
    // racherRating: z.preprocess(
    //   val => (val !== undefined && val !== "" ? Number(val) : undefined),
    //   z.number().min(0).max(100).optional()
    // ),
    breederRating: zod_1.z.preprocess(val => (val !== undefined && val !== "" ? Number(val) : undefined), zod_1.z.number().min(0).max(100).optional()),
    racingRating: zod_1.z.number().optional(),
    results: zod_1.z
        .preprocess((val) => {
        if (!val)
            return undefined;
        if (typeof val === "string") {
            try {
                return JSON.parse(val);
            }
            catch (_a) {
                return [];
            }
        }
        return val;
    }, zod_1.z.array(raceResultSchema).nonempty({ message: "Results objects are required if results is provided" }))
        .optional(),
});
