"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSubscriptionCreated = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../errors/ApiErrors"));
const stripe_1 = __importDefault(require("../config/stripe"));
const subscription_model_1 = require("../app/modules/subscription/subscription.model");
const user_model_1 = require("../app/modules/user/user.model");
const package_model_1 = require("../app/modules/package/package.model");
const notification_service_1 = require("../app/modules/notification/notification.service");
const handleSubscriptionCreated = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log("🔹 Stripe Subscription Webhook triggered");
        // 1️⃣ Retrieve subscription from Stripe
        const subscription = yield stripe_1.default.subscriptions.retrieve(data.id);
        console.log("Subscription retrieved:", subscription);
        // 2️⃣ Retrieve customer
        const customer = (yield stripe_1.default.customers.retrieve(subscription.customer));
        console.log("Customer email:", customer.email);
        if (!(customer === null || customer === void 0 ? void 0 : customer.email)) {
            console.error("❌ No email found for the customer!");
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'No email found for the customer!');
        }
        // 3️⃣ Find user by email
        const existingUser = yield user_model_1.User.findOne({ email: customer.email });
        console.log("Existing user found:", existingUser === null || existingUser === void 0 ? void 0 : existingUser._id);
        if (!existingUser) {
            console.error(`❌ User with Email: ${customer.email} not found!`);
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, `User with Email: ${customer.email} not found!`);
        }
        // 4️⃣ Extract price ID
        let priceId = (_b = (_a = subscription.items.data[0]) === null || _a === void 0 ? void 0 : _a.price) === null || _b === void 0 ? void 0 : _b.id;
        console.log("Price ID from subscription:", priceId);
        // 5️⃣ Find pricing plan by priceId
        let pricingPlan = yield package_model_1.Package.findOne({ priceId });
        // Fallback for free package (price = 0)
        if (!pricingPlan && subscription.items.data[0].price.unit_amount === 0) {
            pricingPlan = yield package_model_1.Package.findOne({ price: 0, status: 'Active' });
            console.log("Fallback Free package found:", pricingPlan === null || pricingPlan === void 0 ? void 0 : pricingPlan._id);
        }
        if (!pricingPlan) {
            console.error(`❌ Pricing plan not found for Price ID: ${priceId}`);
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, `Pricing plan not found for Price ID: ${priceId}`);
        }
        // ✅ Step: Check Free-Trial Logic
        if (pricingPlan.isFreeTrial) {
            if (existingUser.hasUsedFreeTrial) {
                console.log("🚫 User already used the free-trial before. Skipping subscription creation.");
                return; // Stop here, don't create another subscription
            }
            else {
                existingUser.hasUsedFreeTrial = true;
                yield existingUser.save();
                console.log("✅ Marked user as having used free-trial");
            }
        }
        // 6️⃣ Retrieve invoice for trxId and amountPaid
        let trxId = '';
        let amountPaid = 0;
        // try {
        //   const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
        //   // trxId = invoice?.payment_intent as string;
        //   amountPaid = invoice?.total ? invoice.total / 100 : 0;
        //   console.log("Invoice retrieved:", invoice?.id, "Amount paid:", amountPaid,"subscripton ",subscription );
        // } catch (err) {
        //   console.warn("⚠️ Invoice not found or error retrieving invoice:", err);
        // }
        const subscriptions = yield stripe_1.default.subscriptions.retrieve(data.id);
        const start = subscriptions.current_period_start;
        const end = subscriptions.current_period_end;
        // 7️⃣ Prepare subscription data
        // const currentPeriodStart = subscription.current_period_start;
        // const currentPeriodEnd = subscription.current_period_end;
        const subscriptionId = subscription.id;
        const price = subscription.items.data[0].price.unit_amount / 100;
        const remaining = subscription.items.data[0].quantity || 1;
        // 8️⃣ Duplicate check
        const existingSub = yield subscription_model_1.Subscription.findOne({ subscriptionId: subscription.id });
        if (existingSub) {
            console.log("⚠️ Subscription already exists in DB:", existingSub._id);
            return; // Duplicate হলে নতুন save করা বন্ধ
        }
        // 8️⃣ Create subscription in DB
        const newSubscription = new subscription_model_1.Subscription({
            user: existingUser._id,
            customerId: customer.id,
            package: pricingPlan._id,
            status: 'active',
            trxId,
            amountPaid,
            price,
            subscriptionId,
            currentPeriodStart: new Date(start * 1000).toISOString(),
            currentPeriodEnd: new Date(end * 1000).toISOString(),
            remaining,
        });
        // await newSubscription.save();
        // console.log("✅ Subscription saved to DB:", newSubscription._id);
        try {
            yield newSubscription.save();
            console.log("✅ Subscription saved to DB:", newSubscription._id);
        }
        catch (err) {
            if (err.code === 11000) {
                // 11000 = Mongo duplicate key error
                console.log("⚠️ Duplicate subscription ignored:", subscriptionId);
                return;
            }
            throw err;
        }
        // 9️⃣ Update user role
        yield user_model_1.User.findByIdAndUpdate(existingUser._id, { role: 'PAIDUSER', isSubscribed: true, hasAccess: true }, { new: true });
        console.log("✅ User updated to PAIDUSER:", existingUser._id);
        // 🔟 Add notification
        yield notification_service_1.NotificationService.createNotificationToDB({
            text: `A new user has subscribed to ${pricingPlan.title}!`,
            type: 'ADMIN',
            read: false,
            referenceId: existingUser._id.toString(),
        });
        console.log("✅ Notification created for admin");
    }
    catch (error) {
        console.error('❌ Subscription Created Error:', error);
        throw error;
    }
});
exports.handleSubscriptionCreated = handleSubscriptionCreated;
//=================================> update code but not use . 
// import { StatusCodes } from 'http-status-codes';
// import Stripe from 'stripe';
// import stripe from '../config/stripe';
// import ApiError from '../errors/ApiErrors';
// import { Subscription } from '../app/modules/subscription/subscription.model';
// import { User } from '../app/modules/user/user.model';
// import { Package } from '../app/modules/package/package.model';
// import { NotificationService } from '../app/modules/notification/notification.service';
// export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {
//   try {
//     const subscription:any = await stripe.subscriptions.retrieve(data.id);
//     const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
//     if (!customer.email) throw new ApiError(StatusCodes.BAD_REQUEST, 'No email found');
//     const user = await User.findOne({ email: customer.email });
//     if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
//     const priceId = subscription.items.data[0]?.price?.id;
//     const pricingPlan = await Package.findOne({ priceId });
//     if (!pricingPlan) throw new ApiError(StatusCodes.NOT_FOUND, 'Pricing plan not found');
//     // Free-trial check
//     if (pricingPlan.isFreeTrial && user.hasUsedFreeTrial) return;
//     if (pricingPlan.isFreeTrial && !user.hasUsedFreeTrial) {
//       user.hasUsedFreeTrial = true;
//       await user.save();
//     }
//     const start = subscription.current_period_start;
//     const end = subscription.current_period_end;
//     // Duplicate check
//     const existingSub = await Subscription.findOne({ subscriptionId: subscription.id });
//     if (existingSub) return;
//     const newSub = new Subscription({
//       user: user._id,
//       customerId: customer.id,
//       package: pricingPlan._id,
//       status: 'active',
//       trxId: subscription.latest_invoice || '',
//       amountPaid: subscription.items.data[0].price.unit_amount! / 100,
//       price: subscription.items.data[0].price.unit_amount! / 100,
//       subscriptionId: subscription.id,
//       currentPeriodStart: new Date(start * 1000),
//       currentPeriodEnd: new Date(end * 1000),
//       remaining: subscription.items.data[0].quantity || 1,
//     });
//     await newSub.save();
//     // Update user
//     await User.findByIdAndUpdate(user._id, { role: 'PAIDUSER', isSubscribed: true, hasAccess: true });
//     // Notification
//     await NotificationService.createNotificationToDB({
//       text: `A new user has subscribed to ${pricingPlan.title}!`,
//       type: 'ADMIN',
//       read: false,
//       referenceId: user._id.toString(),
//     });
//   } catch (err) {
//     console.error('Subscription Created Error:', err);
//     throw err;
//   }
// };
