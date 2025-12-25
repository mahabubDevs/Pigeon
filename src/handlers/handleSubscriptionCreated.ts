

import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import ApiError from '../errors/ApiErrors';
import stripe from '../config/stripe';
import { Subscription } from '../app/modules/subscription/subscription.model';
import { User } from '../app/modules/user/user.model';
import { Package } from '../app/modules/package/package.model';
import { NotificationService } from '../app/modules/notification/notification.service';

export const handleSubscriptionCreated = async (data: any) => {
  try {
    console.log("🔹 Stripe Subscription Webhook triggered");

    const subscription = data as Stripe.Subscription;

    // 1️⃣ Customer
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    ) as Stripe.Customer;

    if (!customer?.email) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No email found for the customer!');
    }

    // 2️⃣ User
    const existingUser = await User.findOne({ email: customer.email });
    if (!existingUser) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `User with Email: ${customer.email} not found!`
      );
    }

    // 3️⃣ Price & Package
    const item = subscription.items?.data?.[0];
    if (!item) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscription item not found');
    }

    const priceId = item.price?.id;

    let pricingPlan = await Package.findOne({ priceId });
    if (!pricingPlan && item.price?.unit_amount === 0) {
      pricingPlan = await Package.findOne({ price: 0, status: 'Active' });
    }

    if (!pricingPlan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Pricing plan not found');
    }

    // 4️⃣ Free trial logic (same)
    if (pricingPlan.isFreeTrial) {
      if (existingUser.hasUsedFreeTrial) {
        console.log("🚫 User already used free trial");
        return;
      }
      existingUser.hasUsedFreeTrial = true;
      await existingUser.save();
    }

    // =====================================
    // ✅ FIXED: START & END DATE (Stripe safe)
    // =====================================

    const now = Date.now();

    const startTimestamp = item.current_period_start
      ? item.current_period_start * 1000
      : now;

    const endTimestamp = item.current_period_end
      ? item.current_period_end * 1000
      : now + 30 * 24 * 60 * 60 * 1000;

    const currentPeriodStart = new Date(startTimestamp).toISOString();
    const currentPeriodEnd = new Date(endTimestamp).toISOString();

    // =====================================
    // Remaining logic (UNCHANGED)
    // =====================================

    const subscriptionId = subscription.id;
    const price = (item.price?.unit_amount || 0) / 100;
    const remaining = item.quantity || 1;

    // Duplicate check
    const existingSub = await Subscription.findOne({ subscriptionId });
    if (existingSub) {
      console.log("⚠️ Subscription already exists:", existingSub._id);
      return;
    }

    const newSubscription = new Subscription({
      user: existingUser._id,
      customerId: customer.id,
      package: pricingPlan._id,
      status: 'active',
      trxId: subscription.latest_invoice || '',
      amountPaid: price,
      price,
      subscriptionId,
      currentPeriodStart,
      currentPeriodEnd,
      remaining,
    });

    try {
      await newSubscription.save();
      console.log("✅ Subscription saved:", newSubscription._id);
    } catch (err: any) {
      if (err.code === 11000) {
        console.log("⚠️ Duplicate ignored:", subscriptionId);
        return;
      }
      throw err;
    }

    // User update
    await User.findByIdAndUpdate(
      existingUser._id,
      { role: 'PAIDUSER', isSubscribed: true, hasAccess: true },
      { new: true }
    );

    // Notification
    await NotificationService.createNotificationToDB({
      text: `A new user has subscribed to ${pricingPlan.title}!`,
      type: 'ADMIN',
      read: false,
      referenceId: existingUser._id.toString(),
    });

    console.log("✅ Subscription flow completed");

  } catch (error) {
    console.error('❌ Subscription Created Error:', error);
    throw error;
  }
};
