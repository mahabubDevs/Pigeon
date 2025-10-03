

import { Model, Document } from "mongoose";

export interface ISubscription extends Document {
  email: string;
  unsubscribed: boolean;
}

export type SubscriptionModel = Model<ISubscription>;
