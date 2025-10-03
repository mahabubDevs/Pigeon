import { z } from "zod";

// Race result object schema
const raceResultSchema = z.object({
  name: z.string({ required_error: "Race name is required" }).optional(),
  date: z.preprocess(
    val => (val ? new Date(val as string) : undefined),
    z.date({ required_error: "Race date is required" })
  ).optional(),
  distance: z.string({ required_error: "Distance is required" }).optional(),
  total: z.number({ required_error: "Total is required" }).int().optional(),
  place: z.string({ required_error: "Place is required" }).optional(),
});

export const createPigeonZodSchema = z.object({
  ringNumber: z.string({ required_error: "Ring Number is required" }),
  name: z.string({ required_error: "Name is required" }).optional(),
  country: z.string({ required_error: "Country is required" }).optional(),
  birthYear: z.preprocess(
    val => (val !== undefined && val !== "" ? Number(val) : undefined),
    z.number({ required_error: "Birth Year is required" })
      .int()
      .min(1900)
      .max(new Date().getFullYear())
  ).optional(),
  shortInfo: z.string({ required_error: "Short Info is required" }).optional(),
  breeder: z.string({ required_error: "Breeder is required" }).optional(),
  color: z.string({ required_error: "Color is required" }).optional(),
  pattern: z.string().optional(),
  // racherRating: z.preprocess(
  //   val => (val !== undefined && val !== "" ? Number(val) : undefined),
  //   z.number({ required_error: "Racher Rating is required" }).min(0).max(100)
  // ),
  racherRating: z.string().optional(),
  breederRating: z.preprocess(
    val => (val !== undefined && val !== "" ? Number(val) : undefined),
    z.number({ required_error: "Breeder Rating is required" }).min(0).max(100)
  ).optional(),
  racingRating: z.number().optional(),
  gender: z.enum(["Cock", "Hen", "Unknown"], { required_error: "Gender is required" }),
  status: z.string({ required_error: "Status is required" }).optional(),
  location: z.string({ required_error: "Location is required" }).optional(),
  verified: z.boolean().optional(), // Admin can set
  iconic: z.boolean().optional(),   // Admin can set
  iconicScore: z.number().optional(), // Admin can set
  notes: z.string().optional(),
  // photos: z.array(z.string()).min(1, "At least one photo is required"),
  photos: z.array(z.string()).optional(),
  pigeonPhoto: z.string().optional(),
  eyePhoto: z.string().optional(),
  ownershipPhoto: z.string().optional(),
  pedigreePhoto: z.string().optional(),
  DNAPhoto: z.string().optional(),
  results: z
    .preprocess((val) => {
      if (!val) return undefined; // results না দিলে optional
      if (typeof val === "string") {
        try {
          return JSON.parse(val); // string → array of objects
        } catch {
          return [];
        }
      }
      return val;
    }, z.array(raceResultSchema).nonempty({ message: "Results objects are required if results is provided" }))
    .optional(),
  fatherRingId: z.string().optional(),
  motherRingId: z.string().optional(),
});

export const updatePigeonZodSchema = z.object({
  ringNumber: z.string().optional(),
  name: z.string().optional(),
  country: z.string().optional(),
  birthYear: z.preprocess(
    val => (val !== undefined && val !== "" ? Number(val) : undefined),
    z.number().int().min(1900).max(new Date().getFullYear()).optional()
  ),
  shortInfo: z.string().optional(),
  breeder: z.string().optional(),
  color: z.string().optional(),
  pattern: z.string().optional(),
  racherRating: z.string().optional(),
  // racherRating: z.preprocess(
  //   val => (val !== undefined && val !== "" ? Number(val) : undefined),
  //   z.number().min(0).max(100).optional()
  // ),
  breederRating: z.preprocess(
    val => (val !== undefined && val !== "" ? Number(val) : undefined),
    z.number().min(0).max(100).optional()
  ),
  racingRating: z.number().optional(),
  results: z
    .preprocess((val) => {
      if (!val) return undefined;
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return [];
        }
      }
      return val;
    }, z.array(raceResultSchema).nonempty({ message: "Results objects are required if results is provided" }))
    .optional(),
});
