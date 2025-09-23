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
    //  Dashboard Stats
    getDashboardStats: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const stats = yield dashboard_service_1.DashboardService.getDashboardStats();
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.OK,
            success: true,
            message: "Dashboard stats fetched successfully",
            data: stats,
        });
    })),
    // 💰 Monthly Revenue (for graph/chart)
    getMonthlyRevenue: (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const monthlyRevenue = yield subscription_model_1.Subscription.aggregate([
            { $match: { status: "active" } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    totalRevenue: { $sum: "$price" }, // 
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
