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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const dashboard_service_1 = require("./dashboard.service");
const subscription_model_1 = require("../subscription/subscription.model");
exports.DashboardController = {
    // Dashboard Stats with filter
    getDashboardStats: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { filterBy } = req.query;
        // Calculate startDate based on filterBy
        const now = new Date();
        let startDate;
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
        const stats = yield dashboard_service_1.DashboardService.getDashboardStats(startDate);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: "Dashboard stats fetched successfully",
            data: stats,
        });
    })),
    // Monthly Revenue for chart/graph
    getMonthlyRevenue: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { year } = req.query;
        // --- Build match filter ---
        const match = { status: "active" };
        if (year) {
            const y = Number(year);
            const startOfYear = new Date(y, 0, 1); // Jan 1
            const endOfYear = new Date(y, 11, 31, 23, 59, 59, 999); // Dec 31
            match.createdAt = { $gte: startOfYear, $lte: endOfYear };
        }
        const monthlyRevenue = yield subscription_model_1.Subscription.aggregate([
            { $match: match },
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
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: "Monthly revenue fetched successfully",
            data: formattedRevenue,
        });
    })),
};
