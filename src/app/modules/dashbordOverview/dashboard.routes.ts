import express from "express";
import { DashboardController } from "./dashboard.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { authWithPageAccess } from "../../middlewares/authWithPageAccess";

const router = express.Router();

router.get(
  "/stats",
  authWithPageAccess('overview'), // Only Admin and Super Admin can access dashboard stats
  DashboardController.getDashboardStats
);
router.get(
  "/monthly-revenue",
  authWithPageAccess('overview'), // Only Admin and Super Admin can access monthly revenue
  DashboardController.getMonthlyRevenue
);

export const DashboardRoutes = router;
