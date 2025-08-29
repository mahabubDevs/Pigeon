import { Pigeon } from "../pigeon/pigeon.model";
import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";

interface DashboardFilter {
  year?: number; // default currentYear
  month?: number; // optional
  dataTypes?: ("revenue" | "userActivity" | "pedigreeStats")[]; // optional filter
}

export const DashboardService = {
  getFilteredData: async (filter: DashboardFilter) => {
    const now = new Date();
    const year = filter.year || now.getFullYear();
    const monthLimit = filter.month || now.getMonth() + 1;
    const dataTypes = filter.dataTypes || ["revenue", "userActivity", "pedigreeStats"];

    const results: any = {};

    if (dataTypes.includes("revenue")) {
      const revenue = await Subscription.aggregate([
        { 
          $match: { 
            status: "active",
            createdAt: { $gte: new Date(year, 0, 1), $lte: new Date(year, monthLimit, 0, 23, 59, 59) }
          } 
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            totalRevenue: { $sum: "$price" },
          },
        },
        { $sort: { "_id.month": 1 } },
      ]);
      results.revenue = revenue;
    }

    if (dataTypes.includes("userActivity")) {
      const userActivity = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(year, 0, 1), $lte: new Date(year, monthLimit, 0, 23, 59, 59) }
          }
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            totalActivity: { $sum: 1 },
          },
        },
        { $sort: { "_id.month": 1 } },
      ]);
      results.userActivity = userActivity;
    }

    if (dataTypes.includes("pedigreeStats")) {
      const pedigreeStats = await Pigeon.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(year, 0, 1), $lte: new Date(year, monthLimit, 0, 23, 59, 59) }
          }
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
            totalPedigree: { $sum: 1 },
          },
        },
        { $sort: { "_id.month": 1 } },
      ]);
      results.pedigreeStats = pedigreeStats;
    }

    return results;
  },
};
