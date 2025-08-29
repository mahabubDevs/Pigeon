import express from "express";
import { DashboardController } from "./dashboard.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router.get(
  "/stats",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), // Only Admin and Super Admin can access dashboard stats
  DashboardController.getDashboardStats
);
router.get(
  "/monthly-revenue",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), // Only Admin and Super Admin can access monthly revenue
  DashboardController.getMonthlyRevenue
);

export const DashboardRoutes = router;
