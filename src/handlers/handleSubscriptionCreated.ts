import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';
import ApiError from '../errors/ApiErrors';
import stripe from '../config/stripe';
import { Subscription } from '../app/modules/subscription/subscription.model';
import { User } from '../app/modules/user/user.model';
import { Package } from '../app/modules/package/package.model';
import { NotificationService } from '../app/modules/notification/notification.service';

export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {
  try {
    console.log("🔹 Stripe Subscription Webhook triggered");
    
    // 1️⃣ Retrieve subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(data.id);
    console.log("Subscription retrieved:", subscription.id);

    // 2️⃣ Retrieve customer
    const customer = (await stripe.customers.retrieve(subscription.customer as string)) as Stripe.Customer;
    console.log("Customer email:", customer.email);

    if (!customer?.email) {
      console.error("❌ No email found for the customer!");
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No email found for the customer!');
    }

    // 3️⃣ Find user by email
    const existingUser = await User.findOne({ email: customer.email });
    console.log("Existing user found:", existingUser?._id);

    if (!existingUser) {
      console.error(`❌ User with Email: ${customer.email} not found!`);
      throw new ApiError(StatusCodes.NOT_FOUND, `User with Email: ${customer.email} not found!`);
    }

    // 4️⃣ Extract price ID
    let priceId = subscription.items.data[0]?.price?.id;
    console.log("Price ID from subscription:", priceId);

    // 5️⃣ Find pricing plan by priceId
    let pricingPlan = await Package.findOne({ priceId });
    
    // Fallback for free package (price = 0)
    if (!pricingPlan && subscription.items.data[0].price.unit_amount === 0) {
      pricingPlan = await Package.findOne({ price: 0, status: 'Active' });
      console.log("Fallback Free package found:", pricingPlan?._id);
    }

    if (!pricingPlan) {
      console.error(`❌ Pricing plan not found for Price ID: ${priceId}`);
      throw new ApiError(StatusCodes.NOT_FOUND, `Pricing plan not found for Price ID: ${priceId}`);
    }

    // 6️⃣ Retrieve invoice for trxId and amountPaid
    let trxId = '';
    let amountPaid = 0;
    try {
      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
      trxId = invoice?.payment_intent as string;
      amountPaid = invoice?.total ? invoice.total / 100 : 0;
      console.log("Invoice retrieved:", invoice?.id, "Amount paid:", amountPaid);
    } catch (err) {
      console.warn("⚠️ Invoice not found or error retrieving invoice:", err);
    }

    // 7️⃣ Prepare subscription data
    const currentPeriodStart = subscription.current_period_start;
    const currentPeriodEnd = subscription.current_period_end;
    const subscriptionId = subscription.id;
    const price = subscription.items.data[0].price.unit_amount! / 100;
    const remaining = subscription.items.data[0].quantity || 1;


    // 8️⃣ Duplicate check
const existingSub = await Subscription.findOne({ subscriptionId: subscription.id });
if (existingSub) {
  console.log("⚠️ Subscription already exists in DB:", existingSub._id);
  return; // Duplicate হলে নতুন save করা বন্ধ
}

    // 8️⃣ Create subscription in DB
    const newSubscription = new Subscription({
      user: existingUser._id,
      customerId: customer.id,
      package: pricingPlan._id,
      status: 'active',
      trxId,
      amountPaid,
      price,
      subscriptionId,
      currentPeriodStart: new Date(currentPeriodStart * 1000).toISOString(),
      currentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
      remaining,
    });

    await newSubscription.save();
    console.log("✅ Subscription saved to DB:", newSubscription._id);

    // 9️⃣ Update user role
    await User.findByIdAndUpdate(
      existingUser._id,
      { role: 'PAIDUSER', isSubscribed: true, hasAccess: true },
      { new: true }
    );
    console.log("✅ User updated to PAIDUSER:", existingUser._id);

    // 🔟 Add notification
    await NotificationService.createNotificationToDB({
      text: `A new user has subscribed to ${pricingPlan.title}!`,
      type: 'ADMIN',
      read: false,
      referenceId: existingUser._id.toString(),
    });
    console.log("✅ Notification created for admin");

  } catch (error) {
    console.error('❌ Subscription Created Error:', error);
    throw error;
  }
};
