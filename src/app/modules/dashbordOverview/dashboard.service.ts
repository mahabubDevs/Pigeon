import { Pigeon } from "../pigeon/pigeon.model";
import { Subscription } from "../subscription/subscription.model";

export const DashboardService = {
  getDashboardStats: async () => {
    //  Total pigeons
    const totalPigeons = await Pigeon.countDocuments();

    //  Verified pigeons
    const verifiedPigeons = await Pigeon.countDocuments({ verified: true });

    // 
    const iconPigeons = await Pigeon.countDocuments({ iconic: true });

    //  Subscription revenue (total amountPaid sum)
    const subscriptionRevenueAgg = await Subscription.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
    ]);
    const subscriptionRevenue =
      subscriptionRevenueAgg.length > 0 ? subscriptionRevenueAgg[0].totalRevenue : 0;

    //  Recently added pigeons (last 5)
    const recentPigeons = await Pigeon.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate([
      {
        path: 'fatherRingId',
        select: 'ringNumber name',
      },
      {
        path: 'motherRingId',
        select: 'ringNumber name',
      }
    ])
    ;

    return {
      totalPigeons,
      verifiedPigeons,
      iconPigeons,
      subscriptionRevenue,
      recentPigeons,
    };
  },
};
