import { z } from "zod";

export const createPigeonZodSchema = z.object({
  ringNumber: z.string({ required_error: "Ring Number is required" }),
  name: z.string({ required_error: "Name is required" }),
  country: z.string({ required_error: "Country is required" }),
  birthYear: z.preprocess(
    val => (val !== undefined && val !== "" ? Number(val) : undefined),
    z.number({ required_error: "Birth Year is required" })
      .int()
      .min(1900)
      .max(new Date().getFullYear())
  ),
  shortInfo: z.string({ required_error: "Short Info is required" }),
  breeder: z.string({ required_error: "Breeder is required" }),
  color: z.string({ required_error: "Color is required" }),
  pattern: z.string().optional(),
  racherRating: z.preprocess(
    val => (val !== undefined && val !== "" ? Number(val) : undefined),
    z.number({ required_error: "Racher Rating is required" }).min(0).max(100)
  ),
  breederRating: z.preprocess(
    val => (val !== undefined && val !== "" ? Number(val) : undefined),
    z.number({ required_error: "Breeder Rating is required" }).min(0).max(100)
  ),
  gender: z.enum(["Male", "Female", "Unknown"], { required_error: "Gender is required" }),
  status: z.string({ required_error: "Status is required" }),
  location: z.string({ required_error: "Location is required" }),
  racingRating: z.preprocess(
    val => (val !== undefined && val !== "" ? Number(val) : undefined),
    z.number().min(0).max(10).optional()
  ),
  notes: z.string().optional(),
  photos: z.array(z.string()).min(1, "At least one photo is required"), // required
  results: z.string().optional(),
  fatherRingId: z.string().optional(),
  motherRingId: z.string().optional(),
});
