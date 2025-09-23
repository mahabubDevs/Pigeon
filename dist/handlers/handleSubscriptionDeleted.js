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
exports.handleSubscriptionDeleted = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../errors/ApiErrors"));
const stripe_1 = __importDefault(require("../config/stripe"));
const subscription_model_1 = require("../app/modules/subscription/subscription.model");
const user_model_1 = require("../app/modules/user/user.model");
const handleSubscriptionDeleted = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscription = yield stripe_1.default.subscriptions.retrieve(data.id);
        const activeSub = yield subscription_model_1.Subscription.findOne({
            customerId: subscription.customer,
            status: 'active',
        });
        if (!activeSub) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Active subscription not found.');
        }
        yield subscription_model_1.Subscription.findByIdAndUpdate(activeSub._id, { status: 'deactivated' }, { new: true });
        const existingUser = yield user_model_1.User.findById(activeSub.user);
        if (!existingUser) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found.');
        }
        yield user_model_1.User.findByIdAndUpdate(existingUser._id, { hasAccess: false }, { new: true });
    }
    catch (error) {
        console.error('Subscription Deleted Error:', error);
        throw error;
    }
});
exports.handleSubscriptionDeleted = handleSubscriptionDeleted;
