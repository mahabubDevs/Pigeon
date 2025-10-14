import { Pigeon } from "../pigeon/pigeon.model";
import { Subscription } from "../subscription/subscription.model";

export const DashboardService = {
  getDashboardStats: async (startDate?: Date) => {
    // Base query to exclude soft deleted pigeons for stats
    const baseQuery: any = { status: { $ne: "Deleted" } };
    if (startDate) baseQuery.createdAt = { $gte: startDate }; // date filter applied only for stats

    // Total pigeons
    const totalPigeons = await Pigeon.countDocuments(baseQuery);

    // Verified pigeons
    const verifiedPigeons = await Pigeon.countDocuments({
      ...baseQuery,
      verified: true,
    });

    // Iconic pigeons
    const iconPigeons = await Pigeon.countDocuments({
      ...baseQuery,
      iconic: true,
    });

    // Subscription revenue (active subscriptions only, date filter applied)
    const subMatch: any = { status: "active" };
    if (startDate) subMatch.createdAt = { $gte: startDate };

    const subscriptionRevenueAgg = await Subscription.aggregate([
      { $match: subMatch },
      { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
    ]);
    const subscriptionRevenue =
      subscriptionRevenueAgg.length > 0 ? subscriptionRevenueAgg[0].totalRevenue : 0;

    // Recent pigeons: always last 5 pigeons ignoring date filter
    const recentPigeons = await Pigeon.find({ status: { $ne: "Deleted" } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate([
        { path: "fatherRingId", select: "ringNumber name" },
        { path: "motherRingId", select: "ringNumber name" },
        { path: "breeder", select: "breederName" },
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
