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
exports.handleSubscriptionUpdated = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../errors/ApiErrors"));
const stripe_1 = __importDefault(require("../config/stripe"));
const subscription_model_1 = require("../app/modules/subscription/subscription.model");
const user_model_1 = require("../app/modules/user/user.model");
const package_model_1 = require("../app/modules/package/package.model");
const handleSubscriptionUpdated = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Retrieve the subscription from Stripe
        const subscription = yield stripe_1.default.subscriptions.retrieve(data.id);
        // Retrieve customer
        const customer = (yield stripe_1.default.customers.retrieve(subscription.customer));
        if (!(customer === null || customer === void 0 ? void 0 : customer.email)) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'No email found for the customer!');
        }
        // Find user
        const existingUser = yield user_model_1.User.findOne({ email: customer.email });
        if (!existingUser) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, `User with Email: ${customer.email} not found!`);
        }
        // Extract price ID
        const priceId = (_b = (_a = subscription.items.data[0]) === null || _a === void 0 ? void 0 : _a.price) === null || _b === void 0 ? void 0 : _b.id;
        // Find pricing plan
        const pricingPlan = yield package_model_1.Package.findOne({ priceId });
        if (!pricingPlan) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, `Pricing plan with Price ID: ${priceId} not found!`);
        }
        // Invoice details
        const invoice = yield stripe_1.default.invoices.retrieve(subscription.latest_invoice);
        const trxId = invoice === null || invoice === void 0 ? void 0 : invoice.payment_intent;
        const amountPaid = (invoice === null || invoice === void 0 ? void 0 : invoice.total) ? invoice.total / 100 : 0;
        // Required subscription fields
        const currentPeriodStart = subscription.current_period_start;
        const currentPeriodEnd = subscription.current_period_end;
        const subscriptionId = subscription.id;
        const price = subscription.items.data[0].price.unit_amount / 100;
        const remaining = subscription.items.data[0].quantity || 1;
        // Check existing active subscription
        const currentActiveSubscription = yield subscription_model_1.Subscription.findOne({
            user: existingUser._id,
            status: 'active',
        });
        if (currentActiveSubscription) {
            // Deactivate old subscription if price changed
            if (currentActiveSubscription.package.priceId !== pricingPlan.priceId) {
                yield subscription_model_1.Subscription.findByIdAndUpdate(currentActiveSubscription._id, { status: 'deactivated' });
                // Create new subscription
                const newSubscription = new subscription_model_1.Subscription({
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
                yield newSubscription.save();
                yield user_model_1.User.findByIdAndUpdate(existingUser._id, { role: 'PAIDUSER' }, { new: true });
            }
        }
        else {
            // If no active subscription, create new
            const newSubscription = new subscription_model_1.Subscription({
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
            yield newSubscription.save();
            yield user_model_1.User.findByIdAndUpdate(existingUser._id, { role: 'PAIDUSER' }, { new: true });
        }
    }
    catch (error) {
        console.error('Subscription Updated Error:', error);
        throw error;
    }
});
exports.handleSubscriptionUpdated = handleSubscriptionUpdated;
