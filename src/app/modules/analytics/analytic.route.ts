import { Router } from "express";
import { DashboardController } from "./analytic.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router();

// GET /api/dashboard?year=2025&month=8&dataTypes=revenue,userActivity
router.get("/", auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN), DashboardController.getDashboardData);
router.get(
  "/export-excel",
//   auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardController.exportDashboardExcel
);  

export const AnalyticRoutes =  router;
