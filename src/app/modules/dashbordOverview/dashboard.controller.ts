import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { DashboardService } from "./dashboard.service";
import { Subscription } from "../subscription/subscription.model";

export const DashboardController = {
  // Dashboard Stats with filter
  getDashboardStats: catchAsync(async (req: Request, res: Response) => {
    const { filterBy } = req.query;

    // Calculate startDate based on filterBy
    const now = new Date();
    let startDate: Date | undefined;

    switch (filterBy) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // last 7 days
        break;
      case "1month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "3year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 3);
        break;
      default:
        startDate = undefined; // no filter
    }

    const stats = await DashboardService.getDashboardStats(startDate);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Dashboard stats fetched successfully",
      data: stats,
    });
  }),

  // Monthly Revenue for chart/graph
  getMonthlyRevenue: catchAsync(async (req: Request, res: Response) => {
    const monthlyRevenue = await Subscription.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalRevenue: { $sum: "$price" },
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
