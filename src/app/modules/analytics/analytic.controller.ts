import { Request, Response } from "express";
import ExcelJS from "exceljs";
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
  exportDashboardExcel: catchAsync(async (req: Request, res: Response) => {
    const { year, month, dataTypes } = req.query;

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

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Dashboard Data");

    // Dynamic columns based on selected dataTypes
    const columns: any[] = [];
    if (data.revenue) {
      columns.push({ header: "Revenue Month", key: "revMonth" });
      columns.push({ header: "Revenue Year", key: "revYear" });
      columns.push({ header: "Total Revenue", key: "totalRevenue" });
    }
    if (data.userActivity) {
      columns.push({ header: "Activity Month", key: "actMonth" });
      columns.push({ header: "Activity Year", key: "actYear" });
      columns.push({ header: "Total Activity", key: "totalActivity" });
    }
    if (data.pedigreeStats) {
      columns.push({ header: "Pedigree Month", key: "pedMonth" });
      columns.push({ header: "Pedigree Year", key: "pedYear" });
      columns.push({ header: "Total Pedigree", key: "totalPedigree" });
    }

    sheet.columns = columns;

    // Determine max rows length
    const maxRows = Math.max(
      data.revenue?.length || 0,
      data.userActivity?.length || 0,
      data.pedigreeStats?.length || 0
    );

    for (let i = 0; i < maxRows; i++) {
      sheet.addRow({
        revMonth: data.revenue?.[i]?._id.month || "",
        revYear: data.revenue?.[i]?._id.year || "",
        totalRevenue: data.revenue?.[i]?.totalRevenue || "",
        actMonth: data.userActivity?.[i]?._id.month || "",
        actYear: data.userActivity?.[i]?._id.year || "",
        totalActivity: data.userActivity?.[i]?.totalActivity || "",
        pedMonth: data.pedigreeStats?.[i]?._id.month || "",
        pedYear: data.pedigreeStats?.[i]?._id.year || "",
        totalPedigree: data.pedigreeStats?.[i]?.totalPedigree || "",
      });
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=dashboard-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  }),
};