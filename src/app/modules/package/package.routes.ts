import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { PackageController } from "./package.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PackageValidation } from "./package.validation";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
import { authWithPageAccess } from "../../middlewares/authWithPageAccess";
const router = express.Router()

router
    .route("/")
    .post(
        fileUploadHandler(), 
        authWithPageAccess('package'), 
        // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
        validateRequest(PackageValidation.createPackageZodSchema), 
        PackageController.createPackage
    )
    .get(PackageController.getPackage)

router
    .route("/:id")
    .patch(authWithPageAccess('package'), PackageController.updatePackage)
    .delete(authWithPageAccess('package'), PackageController.deletePackage)

export const PackageRoutes = router;