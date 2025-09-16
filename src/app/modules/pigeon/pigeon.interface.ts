import mongoose from "mongoose";

export interface IPigeon {
  user: mongoose.Types.ObjectId; // which user added this pigeon
  ringNumber: string;
  name?: string;
  country?: string;
  birthYear?: number;
  shortInfo?: string;
  breeder?: string;
  color?: string;
  catagory?: string;
  pattern?: string;
  racingRating?: number;
  breederRating?: number;
  gender?: "Male" | "Female" | "Unknown";
  status?: string;
  location?: string;
  racerRating?: number;
  notes?: string;
  photos?: string[]; // multiple photo url
  results?: string; // details text
  fatherRingId?: mongoose.Types.ObjectId; //  pigeon এর ref
  motherRingId?: mongoose.Types.ObjectId; //  pigeon এর ref
  verified?: boolean; // admin verify 
  iconic?: boolean; // iconic pigeon check
  iconicScore?: number; // iconic pigeon score
  createdAt?: Date;
  updatedAt?: Date;
}
