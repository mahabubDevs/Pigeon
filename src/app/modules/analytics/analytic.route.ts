import { Router } from "express";
import { DashboardController } from "./analytic.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { authWithPageAccess } from "../../middlewares/authWithPageAccess";

const router = Router();

// Admin and page access holder
router.get("/", authWithPageAccess('analytics'), DashboardController.getDashboardData);
router.get(
  "/export-excel",
//   auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardController.exportDashboardExcel
);  

export const AnalyticRoutes =  router;
