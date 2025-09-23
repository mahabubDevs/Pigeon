"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticRoutes = void 0;
const express_1 = require("express");
const analytic_controller_1 = require("./analytic.controller");
const authWithPageAccess_1 = require("../../middlewares/authWithPageAccess");
const router = (0, express_1.Router)();
// Admin and page access holder
router.get("/", (0, authWithPageAccess_1.authWithPageAccess)('analytics'), analytic_controller_1.DashboardController.getDashboardData);
router.get("/export-excel", 
//   auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
analytic_controller_1.DashboardController.exportDashboardExcel);
exports.AnalyticRoutes = router;
