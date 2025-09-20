import { Pigeon } from "../pigeon/pigeon.model";
import { Subscription } from "../subscription/subscription.model";

export const DashboardService = {
  getDashboardStats: async () => {
    // Base query to exclude soft deleted pigeons
    const baseQuery = { status: { $ne: "Deleted" } };

    // Total pigeons
    const totalPigeons = await Pigeon.countDocuments(baseQuery);

    // Verified pigeons
    const verifiedPigeons = await Pigeon.countDocuments({ ...baseQuery, verified: true });

    // Iconic pigeons
    const iconPigeons = await Pigeon.countDocuments({ ...baseQuery, iconic: true });

    // Subscription revenue (active subscriptions only)
    const subscriptionRevenueAgg = await Subscription.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
    ]);
    const subscriptionRevenue =
      subscriptionRevenueAgg.length > 0 ? subscriptionRevenueAgg[0].totalRevenue : 0;

    // Recently added pigeons (last 5) excluding soft-deleted
    const recentPigeons = await Pigeon.find(baseQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate([
        { path: "fatherRingId", select: "ringNumber name" },
        { path: "motherRingId", select: "ringNumber name" },
        { path: "breeder", select: "breederName" }
      ]);

    return {
      totalPigeons,
      verifiedPigeons,
      iconPigeons,
      subscriptionRevenue,
      recentPigeons,
    };
  },
};

