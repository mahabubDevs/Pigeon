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
const user_model_1 = require("../user/user.model");
exports.DashboardService = {
    getFilteredData: (filter) => __awaiter(void 0, void 0, void 0, function* () {
        const now = new Date();
        const year = filter.year || now.getFullYear();
        const monthLimit = filter.month || now.getMonth() + 1;
        const dataTypes = filter.dataTypes || ["revenue", "userActivity", "pedigreeStats"];
        const results = {};
        if (dataTypes.includes("revenue")) {
            const revenue = yield subscription_model_1.Subscription.aggregate([
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
            const userActivity = yield user_model_1.User.aggregate([
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
            const pedigreeStats = yield pigeon_model_1.Pigeon.aggregate([
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
    }),
};
