// role.routes.ts
import express from "express";
import { createRole, getRoles } from "./role.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router.post("/", auth(USER_ROLES.ADMIN), createRole);
router.get("/", auth(USER_ROLES.ADMIN), getRoles);

export const RoleRoutes = router;
