import express from "express";
import { BreederController } from "./breeder.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router
  .route("/")
  .post(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), BreederController.createBreeder)
  .get(auth(USER_ROLES.USER, USER_ROLES.PAIDUSER, USER_ROLES.ADMIN), BreederController.getAllBreeders);

router
  .route("/:id")
  .get(auth(USER_ROLES.USER, USER_ROLES.PAIDUSER, USER_ROLES.ADMIN), BreederController.getBreederById)
  .patch(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), BreederController.updateBreeder)
  .delete(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), BreederController.deleteBreeder);

export const BreederRoutes = router;
