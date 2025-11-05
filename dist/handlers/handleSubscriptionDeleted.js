"use strict";
// import { StatusCodes } from 'http-status-codes';
// import Stripe from 'stripe';
// import ApiError from '../errors/ApiErrors';
// import stripe from '../config/stripe';
// import { Subscription } from '../app/modules/subscription/subscription.model';
// import { User } from '../app/modules/user/user.model';
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
exports.handleSubscriptionDeleted = void 0;
// export const handleSubscriptionDeleted = async (data: Stripe.Subscription) => {
//   try {
//     const subscription = await stripe.subscriptions.retrieve(data.id);
//     const activeSub = await Subscription.findOne({
//       customerId: subscription.customer as string,
//       status: 'active',
//     });
//     if (!activeSub) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'Active subscription not found.');
//     }
//     await Subscription.findByIdAndUpdate(activeSub._id, { status: 'deactivated' }, { new: true });
//     const existingUser = await User.findById(activeSub.user);
//     if (!existingUser) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
//     }
//     await User.findByIdAndUpdate(existingUser._id, { hasAccess: false }, { new: true });
//   } catch (error) {
//     console.error('Subscription Deleted Error:', error);
//     throw error;
//   }
// };
const http_status_codes_1 = require("http-status-codes");
const stripe_1 = __importDefault(require("../config/stripe"));
const ApiErrors_1 = __importDefault(require("../errors/ApiErrors"));
const subscription_model_1 = require("../app/modules/subscription/subscription.model");
const user_model_1 = require("../app/modules/user/user.model");
const handleSubscriptionDeleted = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscription = yield stripe_1.default.subscriptions.retrieve(data.id);
        const dbSub = yield subscription_model_1.Subscription.findOne({ subscriptionId: subscription.id });
        if (!dbSub)
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Subscription not found');
        dbSub.status = 'cancel';
        yield dbSub.save();
        // Update user access
        yield user_model_1.User.findByIdAndUpdate(dbSub.user, { role: 'USER', hasAccess: false, isSubscribed: false });
    }
    catch (err) {
        console.error('Subscription Deleted Error:', err);
        throw err;
    }
});
exports.handleSubscriptionDeleted = handleSubscriptionDeleted;
