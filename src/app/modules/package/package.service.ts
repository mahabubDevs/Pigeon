import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IPackage } from "./package.interface";
import { Package } from "./package.model";
import mongoose from "mongoose";
import { createSubscriptionProduct } from "../../../helpers/createSubscriptionProductHelper";
import stripe from "../../../config/stripe";
import Stripe from "stripe";

const createPackageToDB = async (payload: IPackage): Promise<IPackage | null> => {
  console.log("console-1");
    // Step 0: Check if package already exists for this admin and title
    const existingPackage = await Package.findOne({
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
    const product = await createSubscriptionProduct(productPayload);
    console.log("product",product);

    if (!product) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create subscription product");
    }

    // Step 2: Check again if Stripe price already exists for this product
    const existingPrices = await stripe.prices.list({ product: product.productId });
    console.log("existingPrices",existingPrices);
    let price: Stripe.Price;
    if (existingPrices.data.length > 0) {
      console.log('if')
        price = existingPrices.data[0]; // if exists, use the first one
        console.log("Using existing Stripe price:", price.id);
    } else {
      console.log('if')
        price = await stripe.prices.create({
            unit_amount: payload.price * 100,
            currency: "usd",
            product: product.productId,
            recurring: {
                interval: payload.paymentType?.toLowerCase() === "monthly" ? "month" : "year",
            },
        });
    }

    // Step 3: Add Stripe productId, priceId, and paymentLink to payload
    payload.paymentLink = product.paymentLink;
    payload.productId = product.productId;
    payload.priceId = price.id;

    console.log('last')
    // Step 4: Save package in DB
    const result = await Package.create(payload);

    if (!result) {
        await stripe.products.del(product.productId);
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Package");
    }

    return result;
};



const updatePackageToDB = async (
  id: string,
  payload: IPackage
): Promise<IPackage | null> => {
  // Step 1: Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }

  // Step 2: Fetch existing package
  const existingPackage = await Package.findById(id);
  if (!existingPackage) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Package not found");
  }

  // Step 3: Update Stripe product if title/description changed
  if (payload.title || payload.description) {
    await stripe.products.update(existingPackage.productId, {
      name: payload.title || existingPackage.title,
      description: payload.description || existingPackage.description,
    });
  }

  // Step 4: If price changed, create new Stripe price and permanent payment link
  if (payload.price && payload.price !== existingPackage.price) {
    const newPrice = await stripe.prices.create({
      unit_amount: payload.price * 100, // price in cents
      currency: "usd",
      product: existingPackage.productId,
      recurring: {
        interval: payload.paymentType?.toLowerCase() === "monthly" ? "month" : "year",
      },
    });

    // Update payload with new Stripe priceId
    payload.priceId = newPrice.id;

    // ✅ Create permanent Payment Link (not session)
    const paymentLink = await stripe.paymentLinks.create({
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
  const updatedPackage = await Package.findByIdAndUpdate(id, payload, { new: true });

  if (!updatedPackage) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update Package");
  }

  // Step 6: Return all updated data
  return updatedPackage;
};


const getPackageFromDB = async(paymentType: string): Promise<IPackage[]>=>{
    const query:any = {
        status: "Active"
    }
    if(paymentType){
        query.paymentType = paymentType
    }

    const result = await Package.find(query);
    return result;
}

const getPackageDetailsFromDB = async(id: string): Promise<IPackage | null>=>{
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID")
    }
    const result = await Package.findById(id);
    return result;
}

const deletePackageToDB = async(id: string): Promise<IPackage | null>=>{
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID")
    }

    const result = await Package.findByIdAndDelete(id);

    if(!result){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to deleted Package")
    }

    return result;
}

export const PackageService = {
    createPackageToDB,
    updatePackageToDB,
    getPackageFromDB,
    getPackageDetailsFromDB,
    deletePackageToDB
}