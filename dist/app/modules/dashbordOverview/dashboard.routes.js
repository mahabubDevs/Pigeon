"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRoutes = void 0;
const express_1 = __importDefault(require("express"));
const dashboard_controller_1 = require("./dashboard.controller");
const authWithPageAccess_1 = require("../../middlewares/authWithPageAccess");
const router = express_1.default.Router();
router.get("/stats", (0, authWithPageAccess_1.authWithPageAccess)('overview'), // Only Admin and Super Admin can access dashboard stats
dashboard_controller_1.DashboardController.getDashboardStats);
router.get("/monthly-revenue", (0, authWithPageAccess_1.authWithPageAccess)('overview'), // Only Admin and Super Admin can access monthly revenue
dashboard_controller_1.DashboardController.getMonthlyRevenue);
exports.DashboardRoutes = router;
