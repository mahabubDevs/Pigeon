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
exports.subscriptionExpiryCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const user_1 = require("../../enums/user");
const subscription_model_1 = require("../../app/modules/subscription/subscription.model");
const user_model_1 = require("../../app/modules/user/user.model");
/**
 * Cron job to check expired subscriptions every day at midnight
 */
const subscriptionExpiryCron = () => {
    node_cron_1.default.schedule("0 0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Running subscription expiry check...");
        const now = new Date();
        // find all active subscriptions that ended
        const expiredSubscriptions = yield subscription_model_1.Subscription.find({
            status: "active",
            currentPeriodEnd: { $lt: now.toISOString() },
        });
        for (const sub of expiredSubscriptions) {
            yield Promise.all([
                user_model_1.User.findByIdAndUpdate(sub.user, {
                    isSubscribed: false,
                    planType: "FREE_USER",
                    role: user_1.USER_ROLES.USER,
                    subscriptionStart: null,
                    subscriptionEnd: null
                }),
                subscription_model_1.Subscription.findByIdAndUpdate(sub._id, { status: "expired" }),
            ]);
            console.log(`Subscription expired for user: ${sub.user}`);
        }
        console.log("Subscription expiry check finished.");
    }));
};
exports.subscriptionExpiryCron = subscriptionExpiryCron;
