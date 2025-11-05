"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreederValidation = void 0;
// src/modules/breeder/breeder.validation.ts
const zod_1 = require("zod");
// Create schema
const createBreederZodSchema = zod_1.z.object({
    loftName: zod_1.z
        .string({ required_error: "Loft Name is required" })
        .min(2, "Loft Name must be at least 2 characters"),
    breederName: zod_1.z
        .string({ required_error: "Breeder Name is required" })
        .min(2, "Breeder Name must be at least 2 characters").optional(),
    country: zod_1.z
        .string({ required_error: "Country is required" })
        .min(2, "Country must be at least 2 characters")
        .optional(),
    email: zod_1.z
        .string({ required_error: "Email is required" })
        .email("Invalid email address").optional(),
    phone: zod_1.z
        .string({ required_error: "Phone number is required" }).optional(),
    experience: zod_1.z.string().optional(),
    score: zod_1.z.number().optional(),
    gender: zod_1.z.enum(["Hen", "Cock", "Other"]).optional(),
    status: zod_1.z.boolean().optional(),
});
// Update schema (all fields optional)
const updateBreederZodSchema = createBreederZodSchema.partial();
// Export object
exports.BreederValidation = {
    createBreederZodSchema,
    updateBreederZodSchema,
};
