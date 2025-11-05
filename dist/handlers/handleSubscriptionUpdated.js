"use strict";
// import { StatusCodes } from 'http-status-codes';
// import Stripe from 'stripe';
// import ApiError from '../errors/ApiErrors';
// import stripe from '../config/stripe';
// import { Subscription } from '../app/modules/subscription/subscription.model';
// import { User } from '../app/modules/user/user.model';
// import { Package } from '../app/modules/package/package.model';
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
exports.handleSubscriptionUpdated = void 0;
// export const handleSubscriptionUpdated = async (data: Stripe.Subscription) => {
//     try {
//         // Retrieve the subscription from Stripe
//         const subscription = await stripe.subscriptions.retrieve(data.id);
//         // Retrieve customer
//         const customer = (await stripe.customers.retrieve(subscription.customer as string)) as Stripe.Customer;
//         if (!customer?.email) {
//             throw new ApiError(StatusCodes.BAD_REQUEST, 'No email found for the customer!');
//         }
//         // Find user
//         const existingUser = await User.findOne({ email: customer.email });
//         if (!existingUser) {
//             throw new ApiError(StatusCodes.NOT_FOUND, `User with Email: ${customer.email} not found!`);
//         }
//         // Extract price ID
//         const priceId = subscription.items.data[0]?.price?.id;
//         // Find pricing plan
//         const pricingPlan = await Package.findOne({ priceId });
//         if (!pricingPlan) {
//             throw new ApiError(StatusCodes.NOT_FOUND, `Pricing plan with Price ID: ${priceId} not found!`);
//         }
//         // Invoice details
//         const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
//         const trxId = invoice?.payment_intent as string;
//         const amountPaid = invoice?.total ? invoice.total / 100 : 0;
//         // Required subscription fields
//         const currentPeriodStart = subscription.current_period_start;
//         const currentPeriodEnd = subscription.current_period_end;
//         const subscriptionId = subscription.id;
//         const price = subscription.items.data[0].price.unit_amount! / 100;
//         const remaining = subscription.items.data[0].quantity || 1;
//         // Check existing active subscription
//         const currentActiveSubscription = await Subscription.findOne({
//             user: existingUser._id,
//             status: 'active',
//         });
//         if (currentActiveSubscription) {
//             // Deactivate old subscription if price changed
//             if ((currentActiveSubscription.package as any).priceId !== pricingPlan.priceId) {
//                 await Subscription.findByIdAndUpdate(currentActiveSubscription._id, { status: 'deactivated' });
//                 // Create new subscription
//                 const newSubscription = new Subscription({
//                     user: existingUser._id,
//                     customerId: customer.id,
//                     package: pricingPlan._id,
//                     status: 'active',
//                     trxId,
//                     amountPaid,
//                     price,
//                     subscriptionId,
//                     currentPeriodStart: new Date(currentPeriodStart * 1000).toISOString(),
//                     currentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
//                     remaining,
//                 });
//                 await newSubscription.save();
//                 await User.findByIdAndUpdate(existingUser._id, { role: 'PAIDUSER' }, { new: true });
//             }
//         } else {
//             // If no active subscription, create new
//             const newSubscription = new Subscription({
//                 user: existingUser._id,
//                 customerId: customer.id,
//                 package: pricingPlan._id,
//                 status: 'active',
//                 trxId,
//                 amountPaid,
//                 price,
//                 subscriptionId,
//                 currentPeriodStart: new Date(currentPeriodStart * 1000).toISOString(),
//                 currentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
//                 remaining,
//             });
//             await newSubscription.save();
//             await User.findByIdAndUpdate(existingUser._id, { role: 'PAIDUSER' }, { new: true });
//         }
//     } catch (error) {
//         console.error('Subscription Updated Error:', error);
//         throw error;
//     }
// };
const http_status_codes_1 = require("http-status-codes");
const stripe_1 = __importDefault(require("../config/stripe"));
const ApiErrors_1 = __importDefault(require("../errors/ApiErrors"));
const subscription_model_1 = require("../app/modules/subscription/subscription.model");
const user_model_1 = require("../app/modules/user/user.model");
const package_model_1 = require("../app/modules/package/package.model");
const handleSubscriptionUpdated = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const subscription = yield stripe_1.default.subscriptions.retrieve(data.id);
        const customer = yield stripe_1.default.customers.retrieve(subscription.customer);
        if (!customer.email)
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'No email found');
        const user = yield user_model_1.User.findOne({ email: customer.email });
        if (!user)
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
        const priceId = (_b = (_a = subscription.items.data[0]) === null || _a === void 0 ? void 0 : _a.price) === null || _b === void 0 ? void 0 : _b.id;
        const pricingPlan = yield package_model_1.Package.findOne({ priceId });
        if (!pricingPlan)
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Pricing plan not found');
        const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const trxId = subscription.latest_invoice || '';
        let dbSub = yield subscription_model_1.Subscription.findOne({ subscriptionId: subscription.id });
        if (!dbSub) {
            // New subscription if somehow not exists in DB
            dbSub = new subscription_model_1.Subscription({
                user: user._id,
                customerId: customer.id,
                package: pricingPlan._id,
                status: 'active',
                trxId,
                amountPaid: subscription.items.data[0].price.unit_amount / 100,
                price: subscription.items.data[0].price.unit_amount / 100,
                subscriptionId: subscription.id,
                currentPeriodStart,
                currentPeriodEnd,
                remaining: subscription.items.data[0].quantity || 1,
            });
            yield dbSub.save();
        }
        else {
            // Auto-renew or update
            dbSub.currentPeriodStart = currentPeriodStart;
            dbSub.currentPeriodEnd = currentPeriodEnd;
            // Auto-renew or cancel mapping
            dbSub.status = subscription.status === 'active' ? 'active' : 'cancel';
            yield dbSub.save();
        }
        // Update user access
        if (subscription.status === 'active') {
            yield user_model_1.User.findByIdAndUpdate(user._id, { role: 'PAIDUSER', isSubscribed: true, hasAccess: true });
        }
        else {
            yield user_model_1.User.findByIdAndUpdate(user._id, { role: 'USER', isSubscribed: false, hasAccess: false });
        }
    }
    catch (err) {
        console.error('Subscription Updated Error:', err);
        throw err;
    }
});
exports.handleSubscriptionUpdated = handleSubscriptionUpdated;
