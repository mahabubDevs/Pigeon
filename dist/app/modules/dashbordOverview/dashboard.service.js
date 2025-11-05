"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const pigeon_model_1 = require("../pigeon/pigeon.model");
const subscription_model_1 = require("../subscription/subscription.model");
exports.DashboardService = {
    getDashboardStats: (startDate) => __awaiter(void 0, void 0, void 0, function* () {
        // Base query to exclude soft deleted pigeons for stats
        const baseQuery = { status: { $ne: "Deleted" }, };
        if (startDate)
            baseQuery.createdAt = { $gte: startDate }; // date filter applied only for stats
        // Total pigeons
        // const totalPigeons = await Pigeon.countDocuments(baseQuery);
        const totalPigeons = yield pigeon_model_1.Pigeon.countDocuments(Object.assign(Object.assign({}, baseQuery), { name: { $exists: true, $ne: "" } }));
        // Verified pigeons
        const verifiedPigeons = yield pigeon_model_1.Pigeon.countDocuments(Object.assign(Object.assign({}, baseQuery), { verified: true }));
        // Iconic pigeons
        const iconPigeons = yield pigeon_model_1.Pigeon.countDocuments(Object.assign(Object.assign({}, baseQuery), { iconic: true }));
        // Subscription revenue (active subscriptions only, date filter applied)
        const subMatch = { status: "active" };
        if (startDate)
            subMatch.createdAt = { $gte: startDate };
        const subscriptionRevenueAgg = yield subscription_model_1.Subscription.aggregate([
            { $match: subMatch },
            { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
        ]);
        const subscriptionRevenue = subscriptionRevenueAgg.length > 0 ? subscriptionRevenueAgg[0].totalRevenue : 0;
        // Recent pigeons: always last 5 pigeons ignoring date filter
        const recentPigeons = yield pigeon_model_1.Pigeon.find({ status: { $ne: "Deleted" }, name: { $exists: true, $ne: "" } })
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
    }),
};
