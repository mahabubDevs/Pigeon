import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { DashboardService } from "./dashboard.service";
import { Subscription } from "../subscription/subscription.model";

export const DashboardController = {
  //  Dashboard Stats
  getDashboardStats: catchAsync(async (req: Request, res: Response) => {
    const stats = await DashboardService.getDashboardStats();

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Dashboard stats fetched successfully",
      data: stats,
    });
  }),

  // 💰 Monthly Revenue (for graph/chart)
  getMonthlyRevenue: catchAsync(async (req: Request, res: Response) => {
    const monthlyRevenue = await Subscription.aggregate([
      { $match: { status: "active" } },

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: { $sum: "$price" }, // 
        },
      },

      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const formattedRevenue = monthlyRevenue.map(item => ({
      year: item._id.year,
      month: item._id.month,
      revenue: item.totalRevenue,
    }));

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Monthly revenue fetched successfully",
      data: formattedRevenue,
    });
  }),
};
