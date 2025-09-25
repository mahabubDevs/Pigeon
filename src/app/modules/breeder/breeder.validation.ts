// src/modules/breeder/breeder.validation.ts
import { z } from "zod";

// Create schema
const createBreederZodSchema = z.object({
  loftName: z
    .string({ required_error: "Loft Name is required" })
    .min(2, "Loft Name must be at least 2 characters"),
    
  breederName: z
    .string({ required_error: "Breeder Name is required" })
    .min(2, "Breeder Name must be at least 2 characters"),
    
  country: z
    .string({ required_error: "Country is required" })
    .min(2, "Country must be at least 2 characters")
    .optional()
    ,
    
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address").optional(),
    
  phone: z
    .string({ required_error: "Phone number is required" }).optional(),

    experience: z.string().optional(),
    score: z.number().optional(),
  gender: z.enum(["Hen", "Cock", "Other"]).optional(),
  status: z.boolean().optional(),
    
});

// Update schema (all fields optional)
const updateBreederZodSchema = createBreederZodSchema.partial();

// Export object
export const BreederValidation = {
  createBreederZodSchema,
  updateBreederZodSchema,
};
