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
exports.createSubscriptionProduct = void 0;
const http_status_codes_1 = require("http-status-codes");
const stripe_1 = __importDefault(require("../config/stripe"));
const ApiErrors_1 = __importDefault(require("../errors/ApiErrors"));
const createSubscriptionProduct = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Create Product in Stripe
    const product = yield stripe_1.default.products.create({
        name: payload.title,
        description: payload.description,
    });
    let interval = 'month'; // Default to 'month'
    let intervalCount = 1; // Default to every 1 month
    // Map duration to interval_count
    switch (payload.duration) {
        case '1 month':
            interval = 'month';
            intervalCount = 1;
            break;
        case '3 months':
            interval = 'month';
            intervalCount = 3;
            break;
        case '6 months':
            interval = 'month';
            intervalCount = 6;
            break;
        case '1 year':
            interval = 'year';
            intervalCount = 1;
            break;
        default:
            interval = 'month';
            intervalCount = 1; // Defaults to 1 month if duration is not specified
    }
    // Create Price for the Product
    const price = yield stripe_1.default.prices.create({
        product: product.id,
        unit_amount: Number(payload.price) * 100, // in cents
        currency: 'usd', // or your chosen currency
        recurring: { interval, interval_count: intervalCount },
    });
    if (!price) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to create price in Stripe");
    }
    // 4️⃣ Find or create Stripe Customer
    //   let customerId = User.stripeCustomerId;
    //   if (!customerId) {
    //     const stripeCustomer = await stripe.customers.create({
    //       email: User.email,
    //       name: User.name,
    //     });
    //     customerId = stripeCustomer.id;
    //     // Save to user DB (pseudo)
    //     // await User.findByIdAndUpdate(user.id, { stripeCustomerId: customerId });
    //   }
    // Create a Payment Link
    const paymentLink = yield stripe_1.default.paymentLinks.create({
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        after_completion: {
            type: 'redirect',
            redirect: {
                url: 'https://thepigeonhub.com/payment-success', // Redirect URL on successful payment
            },
        },
        // customer: customerId,
        metadata: {
            productId: product.id,
        },
    });
    if (!paymentLink.url) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to create payment link");
    }
    return { productId: product.id, paymentLink: paymentLink.url };
});
exports.createSubscriptionProduct = createSubscriptionProduct;
