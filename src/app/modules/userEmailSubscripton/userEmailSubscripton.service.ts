
import { StatusCodes } from "http-status-codes";

import  { userEmailSubscripton as userEmailSubscriptonSchema } from "./userEmailSubscripton.model";

import ApiError from "../../../errors/ApiErrors";
import { ISubscription } from "./userEmailSubscripton.interface";

// subscription create
const createSubscriptionToDB = async (payload: ISubscription): Promise<ISubscription> => {
  const exists = await userEmailSubscriptonSchema.findOne({ email: payload.email });
  if (exists && !exists.unsubscribed) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Already Subscribed");
  }

  if (exists && exists.unsubscribed) {
    exists.unsubscribed = false;
    return await exists.save();
  }

  const sub = await userEmailSubscriptonSchema.create(payload);
  return sub;
};




export const SubscriptionService = {
  createSubscriptionToDB,

};
