import mongoose from "mongoose";

export interface IPigeon {
  user: mongoose.Types.ObjectId; // যে ইউজার অ্যাড করবে
  ringNumber: string;
  name?: string;
  country?: string;
  birthYear?: number;
  shortInfo?: string;
  breeder?: string;
  color?: string;
  pattern?: string;
  racherRating?: number;
  breederRating?: number;
  gender?: "Male" | "Female" | "Unknown";
  status?: string;
  location?: string;
  racingRating?: number;
  notes?: string;
  photos?: string[]; // multiple photo url
  results?: string; // details text
  fatherRingId?: mongoose.Types.ObjectId; // অন্য pigeon এর ref
  motherRingId?: mongoose.Types.ObjectId; // অন্য pigeon এর ref
  createdAt?: Date;
  updatedAt?: Date;
}
