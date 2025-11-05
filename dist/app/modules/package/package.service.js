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
exports.PackageService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const package_model_1 = require("./package.model");
const mongoose_1 = __importDefault(require("mongoose"));
const createSubscriptionProductHelper_1 = require("../../../helpers/createSubscriptionProductHelper");
const stripe_1 = __importDefault(require("../../../config/stripe"));
const createPackageToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("console-1");
    // Step 0: Check if package already exists for this admin and title
    const existingPackage = yield package_model_1.Package.findOne({
        title: payload.title,
        status: "Active"
    });
    if (existingPackage) {
        console.log("Package already exists in DB, skipping Stripe creation.");
        return existingPackage; // Stripe create হবে না
    }
    const productPayload = {
        title: payload.title,
        description: payload.description,
        duration: payload.duration,
        price: Number(payload.price),
    };
    // Step 1: Create product in Stripe
    const product = yield (0, createSubscriptionProductHelper_1.createSubscriptionProduct)(productPayload);
    console.log("product", product);
    if (!product) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to create subscription product");
    }
    // Step 2: Check again if Stripe price already exists for this product
    const existingPrices = yield stripe_1.default.prices.list({ product: product.productId });
    console.log("existingPrices", existingPrices);
    let price;
    if (existingPrices.data.length > 0) {
        console.log('if');
        price = existingPrices.data[0]; // if exists, use the first one
        console.log("Using existing Stripe price:", price.id);
    }
    else {
        console.log('if');
        price = yield stripe_1.default.prices.create({
            unit_amount: payload.price * 100,
            currency: "usd",
            product: product.productId,
            recurring: {
                interval: ((_a = payload.paymentType) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "monthly" ? "month" : "year",
            },
        });
    }
    // Step 3: Add Stripe productId, priceId, and paymentLink to payload
    payload.paymentLink = product.paymentLink;
    payload.productId = product.productId;
    payload.priceId = price.id;
    console.log('last');
    // Step 4: Save package in DB
    const result = yield package_model_1.Package.create(payload);
    if (!result) {
        yield stripe_1.default.products.del(product.productId);
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to create Package");
    }
    return result;
});
const updatePackageToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Step 1: Validate ID
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid ID");
    }
    // Step 2: Fetch existing package
    const existingPackage = yield package_model_1.Package.findById(id);
    if (!existingPackage) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Package not found");
    }
    // Step 3: Update Stripe product if title/description changed
    if (payload.title || payload.description) {
        yield stripe_1.default.products.update(existingPackage.productId, {
            name: payload.title || existingPackage.title,
            description: payload.description || existingPackage.description,
        });
    }
    // Step 4: If price changed, create new Stripe price and permanent payment link
    if (payload.price && payload.price !== existingPackage.price) {
        const newPrice = yield stripe_1.default.prices.create({
            unit_amount: payload.price * 100, // price in cents
            currency: "usd",
            product: existingPackage.productId,
            recurring: {
                interval: ((_a = payload.paymentType) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "monthly" ? "month" : "year",
            },
        });
        // Update payload with new Stripe priceId
        payload.priceId = newPrice.id;
        // ✅ Create permanent Payment Link (not session)
        const paymentLink = yield stripe_1.default.paymentLinks.create({
            line_items: [
                {
                    price: newPrice.id,
                    quantity: 1,
                },
            ],
        });
        // Save permanent payment link
        payload.paymentLink = paymentLink.url;
    }
    // Step 5: Update MongoDB
    const updatedPackage = yield package_model_1.Package.findByIdAndUpdate(id, payload, { new: true });
    if (!updatedPackage) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to update Package");
    }
    // Step 6: Return all updated data
    return updatedPackage;
});
const getPackageFromDB = (paymentType) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        status: "Active"
    };
    if (paymentType) {
        query.paymentType = paymentType;
    }
    const result = yield package_model_1.Package.find(query);
    return result;
});
const getPackageDetailsFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid ID");
    }
    const result = yield package_model_1.Package.findById(id);
    return result;
});
const deletePackageToDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Invalid ID");
    }
    const result = yield package_model_1.Package.findByIdAndDelete(id);
    if (!result) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to deleted Package");
    }
    return result;
});
exports.PackageService = {
    createPackageToDB,
    updatePackageToDB,
    getPackageFromDB,
    getPackageDetailsFromDB,
    deletePackageToDB
};
