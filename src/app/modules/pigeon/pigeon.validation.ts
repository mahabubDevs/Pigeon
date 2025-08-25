import { z } from "zod";

// Validation for parsed JSON data (not req.body directly)
const createPigeonZodSchema = z.object({
  ringNumber: z.string({ required_error: "Ring Number is required" }),
  name: z.string().optional(),
  country: z.string().optional(),
  birthYear: z
    .number()
    .int()
    .min(1900, "Invalid birth year")
    .max(new Date().getFullYear(), "Birth year cannot be in future")
    .optional(),
  shortInfo: z.string().optional(),
  breeder: z.string().optional(),
  color: z.string().optional(),
  pattern: z.string().optional(),
  racherRating: z.number().min(0).max(10).optional(),
  breederRating: z.number().min(0).max(10).optional(),
  gender: z.enum(["Male", "Female", "Unknown"]).optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  racingRating: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
  results: z.string().optional(),
  father: z.string().optional(),
  mother: z.string().optional(),
});

const updatePigeonZodSchema = createPigeonZodSchema.partial();

export const PigeonValidation = {
  createPigeonZodSchema,
  updatePigeonZodSchema,
};
