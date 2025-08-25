import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { PigeonController } from "./pigeon.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PigeonValidation } from "./pigeon.validation";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
const router = express.Router()

router
    .route("/")
    .post(
        fileUploadHandler(), 
        auth( USER_ROLES.USER), 
        PigeonController.createPigeon 
    )
    .get(PigeonController.getAllPigeons)

router
    .route("/:id")
    .get(PigeonController.getPigeonDetails)
    .patch(fileUploadHandler(),auth( USER_ROLES.USER), PigeonController.updatePigeon)
    .delete(auth( USER_ROLES.USER), PigeonController.deletePigeon)
router
  .route('/family/:id')
  .get(PigeonController.getPigeonWithFamily);
router
  .route('/siblings/:id')
  .get(PigeonController.getSiblingsController);

export const PigeonRoutes = router;