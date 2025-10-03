import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SubscriptionService } from "./userEmailSubscripton.service";

const createSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await SubscriptionService.createSubscriptionToDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscribed Successfully",
    data: result,
  });
});

export const SubscriptionController = {
  createSubscription,

};
