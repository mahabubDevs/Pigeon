import express from "express";
import { BreederController } from "./breeder.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { authWithPageAccess } from "../../middlewares/authWithPageAccess";
import { validateFormData } from "../../middlewares/validateFormData";
import { BreederValidation } from "./breeder.validation";

const router = express.Router();

router
  .route("/")
  .post(authWithPageAccess('breeder'),
  validateFormData(BreederValidation.createBreederZodSchema),
   BreederController.createBreeder
  )
  .get(auth(USER_ROLES.USER, USER_ROLES.PAIDUSER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), BreederController.getAllBreeders);
router
  .route("/verify")
 
  .get(auth(USER_ROLES.USER, USER_ROLES.PAIDUSER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), BreederController.getVerifyAllBreeders);

router
  .route("/:id")
  .get(auth(USER_ROLES.USER, USER_ROLES.PAIDUSER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), BreederController.getBreederById)
  .patch(authWithPageAccess('breeder'), BreederController.updateBreeder)
  .delete(authWithPageAccess('breeder'), BreederController.deleteBreeder);

export const BreederRoutes = router;
