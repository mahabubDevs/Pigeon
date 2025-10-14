import mongoose from "mongoose";

export interface IPigeon {
  user: mongoose.Types.ObjectId; // which user added this pigeon
  ringNumber: string;
  name?: string;
  country?: string;
  birthYear?: number;
  shortInfo?: string;
  breeder?:  mongoose.Types.ObjectId;
  addresults?: string;
  color?: string;
  catagory?: string;
  pattern?: string;
  racingRating?: number;
  breederRating?: number;
  gender?: string;
  status?: string;
  location?: string;
  racherRating?: string;
  notes?: string;
  photos?: string[]; // multiple photo url
  pigeonPhoto? : string;
  eyePhoto? : string;
  ownershipPhoto? : string;
  pedigreePhoto? : string;
  DNAPhoto? : string;
  results?: {
    name: string;
    date: Date;
    distance: string; // string now
    total: number;
    place: string; // string now
  }[]; // race result-এর array
  fatherRingId?: mongoose.Types.ObjectId; //  pigeon এর ref
  motherRingId?: mongoose.Types.ObjectId; //  pigeon এর ref
  verified?: boolean; // admin verify 
  iconic?: boolean; // iconic pigeon check
  iconicScore?: number; // iconic pigeon score
  createdAt?: Date;
  updatedAt?: Date;
  remaining?:string[];
}
