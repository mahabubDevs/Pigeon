import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { PigeonController } from "./pigeon.controller";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
// import { PigeonValidation } from "./pigeon.validation";
import { validateFormData } from "../../middlewares/validateFormData";
import { createPigeonZodSchema } from "./pigeon.validation";



const router = express.Router()

router
    .route("/")
    .post(
        fileUploadHandler(), 
        auth( USER_ROLES.USER, USER_ROLES.PAIDUSER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), 
        validateFormData(createPigeonZodSchema),
        PigeonController.createPigeon 
    )
    .get(PigeonController.getAllPigeons)
router
.route("/export")
  .get(
    auth( USER_ROLES.PAIDUSER),
    PigeonController.exportPigeonsPDF
  );
router
  .route("/import")
    .post(
      fileUploadHandler(),
      auth( USER_ROLES.PAIDUSER),
      PigeonController.importPigeons
    );
router
  .route("/search")
  .get(PigeonController.searchPigeonsByName);
 router
  .route('/myAllpigeons')
  
  .get( auth(USER_ROLES.USER, USER_ROLES.PAIDUSER,USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN), PigeonController.getMyAllPigeons);

router
    .route("/:id")
    .get(PigeonController.getPigeonDetails)
    .patch(fileUploadHandler(),auth( USER_ROLES.USER, USER_ROLES.PAIDUSER,USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), PigeonController.updatePigeon)
    .delete(auth( USER_ROLES.USER, USER_ROLES.PAIDUSER, USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN), PigeonController.deletePigeon)
router
  .route('/family/:id')
  .get(PigeonController.getPigeonWithFamily);

router
  .route('/siblings/:id')
  .get(auth( USER_ROLES.PAIDUSER), PigeonController.getSiblingsController);

router
  .route('/my-pigeons/:id')
  .get( PigeonController.getMyPigeons);





export const PigeonRoutes = router;