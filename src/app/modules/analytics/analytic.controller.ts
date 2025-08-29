import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DashboardService } from "./analytic.service";

export const DashboardController = {
  getDashboardData: catchAsync(async (req: Request, res: Response) => {
    const { year, month, dataTypes } = req.query;

    // Query parameters parse
    const allowedTypes = ["revenue", "userActivity", "pedigreeStats"] as const;
    const filter = {
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      dataTypes: dataTypes
        ? ((dataTypes as string)
            .split(",")
            .filter((type): type is typeof allowedTypes[number] =>
              allowedTypes.includes(type as any)
            ))
        : undefined,
    };

    const data = await DashboardService.getFilteredData(filter);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Dashboard data fetched successfully",
      data,
    });
  }),
};
