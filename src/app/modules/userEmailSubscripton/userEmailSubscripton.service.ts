import { StatusCodes } from "http-status-codes";
import { userEmailSubscripton as userEmailSubscriptonSchema } from "./userEmailSubscripton.model";
import ApiError from "../../../errors/ApiErrors";
import { ISubscription } from "./userEmailSubscripton.interface";
import { emailHelper } from "../../../helpers/emailHelper";

// Load admin email from .env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

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

  // 3️⃣ Send email to admin (from .env)
  if (ADMIN_EMAIL) {
    const html = `<p>New subscription from user: <b>${payload.email}</b></p>`;

    await emailHelper.sendEmail({
      to: ADMIN_EMAIL,
      subject: "New User Subscription",
      html,
    });

    console.log("✅ Subscription email sent to admin:", ADMIN_EMAIL);
  } else {
    console.error("❌ ADMIN_EMAIL not set in .env file!");
  }

  console.log("test-2");
  return sub;
};

export const SubscriptionService = {
  createSubscriptionToDB,
};
