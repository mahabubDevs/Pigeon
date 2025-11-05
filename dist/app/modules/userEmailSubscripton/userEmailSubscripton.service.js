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
exports.SubscriptionService = void 0;
const http_status_codes_1 = require("http-status-codes");
const userEmailSubscripton_model_1 = require("./userEmailSubscripton.model");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const emailHelper_1 = require("../../../helpers/emailHelper");
// Load admin email from .env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const createSubscriptionToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // 1️⃣ Check if already subscribed
    const exists = yield userEmailSubscripton_model_1.userEmailSubscripton.findOne({ email: payload.email });
    if (exists && !exists.unsubscribed) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Already Subscribed");
    }
    if (exists && exists.unsubscribed) {
        exists.unsubscribed = false;
        yield exists.save();
    }
    console.log("test-1");
    // 2️⃣ Create new subscription
    const sub = yield userEmailSubscripton_model_1.userEmailSubscripton.create(payload);
    // 3️⃣ Send email to admin (from .env)
    if (ADMIN_EMAIL) {
        const html = `<p>New subscription from user: <b>${payload.email}</b></p>`;
        yield emailHelper_1.emailHelper.sendEmail({
            to: ADMIN_EMAIL,
            subject: "New User Subscription",
            html,
        });
        console.log("✅ Subscription email sent to admin:", ADMIN_EMAIL);
    }
    else {
        console.error("❌ ADMIN_EMAIL not set in .env file!");
    }
    console.log("test-2");
    return sub;
});
exports.SubscriptionService = {
    createSubscriptionToDB,
};
