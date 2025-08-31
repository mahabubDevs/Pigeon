import express from "express";
import { BreederController } from "./breeder.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { authWithPageAccess } from "../../middlewares/authWithPageAccess";

const router = express.Router();

router
  .route("/")
  .post(authWithPageAccess('breeder'), BreederController.createBreeder)
  .get(auth(USER_ROLES.USER, USER_ROLES.PAIDUSER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), BreederController.getAllBreeders);

router
  .route("/:id")
  .get(auth(USER_ROLES.USER, USER_ROLES.PAIDUSER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), BreederController.getBreederById)
  .patch(authWithPageAccess('breeder'), BreederController.updateBreeder)
  .delete(authWithPageAccess('breeder'), BreederController.deleteBreeder);

export const BreederRoutes = router;
