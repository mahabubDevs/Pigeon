import { model, Schema } from "mongoose";
import { ISubscription, SubscriptionModel } from "./userEmailSubscripton.interface";

const userEmailSubscriptonSchema = new Schema<ISubscription, SubscriptionModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    unsubscribed: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

export const userEmailSubscripton = model<ISubscription, SubscriptionModel>(
  "userEmailSubscripton",
  userEmailSubscriptonSchema
);
