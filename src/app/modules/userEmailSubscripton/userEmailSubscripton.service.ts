import { StatusCodes } from "http-status-codes";
import { userEmailSubscripton as userEmailSubscriptonSchema } from "./userEmailSubscripton.model";
import ApiError from "../../../errors/ApiErrors";
import { ISubscription } from "./userEmailSubscripton.interface";
import { emailHelper } from "../../../helpers/emailHelper";
import { User } from "../user/user.model";
// import User from "../../user/user.model"; // Admin user collection import

const createSubscriptionToDB = async (payload: ISubscription): Promise<ISubscription> => {
  // 1️⃣ Check if already subscribed
  const exists = await userEmailSubscriptonSchema.findOne({ email: payload.email });
  if (exists && !exists.unsubscribed) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Already Subscribed");
  }

  if (exists && exists.unsubscribed) {
    exists.unsubscribed = false;
    await exists.save();
  }

  console.log("test-1");
  // 2️⃣ Create new subscription
  const sub = await userEmailSubscriptonSchema.create(payload);

  // 3️⃣ Send email to admin
  const admins = await User.find({ role: "ADMIN" }).select("email name");

  const html = `<p>New subscription from user: <b>${payload.email}</b></p>`;

  for (const admin of admins) {
    await emailHelper.sendEmail({
      to: admin.email,
      subject: "New User Subscription",
      html,
    });
    console.log(admin,"admin");
  }
console.log("test-2");
  return sub;
};

export const SubscriptionService = {
  createSubscriptionToDB,
};
