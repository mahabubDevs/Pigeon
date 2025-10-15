import { Document, Types } from "mongoose";

export interface ILoft extends Document {
  loftName: string;
  breeder?: Types.ObjectId;
  country?: string;
  status: boolean; // verified or not
  createdAt?: Date;
  updatedAt?: Date;
}
