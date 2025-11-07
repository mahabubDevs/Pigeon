import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { PigeonController } from "./pigeon.controller";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
// import { PigeonValidation } from "./pigeon.validation";
import { validateFormData } from "../../middlewares/validateFormData";
import { createPigeonZodSchema } from "./pigeon.validation";
import { authWithPageAccess } from "../../middlewares/authWithPageAccess";



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
    .get(PigeonController.getAllPigeonsAdmin)
router
    .route("/getAllPigeonsAdmin")
   
    .get(PigeonController.getAllPigeonsAdmin)
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
  .route("/searchAll")
  .get(PigeonController.searchAllPigeonsByName);
router
  .route("/searchAllPigeon")
  .get(auth( USER_ROLES.PAIDUSER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), PigeonController.searchAllPigeonsByName);
router
  .route("/searchAllName")
  .get(PigeonController.searchAllName);

  router.route("/check-duplicate").get(PigeonController.checkDuplicatePigeon);

 router
  .route('/myAllpigeons')
  // .get( authWithPageAccess('pigeon'), PigeonController.getMyAllPigeons);
  
  .get( auth(USER_ROLES.USER, USER_ROLES.PAIDUSER,USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN), PigeonController.getMyAllPigeons);

router
    .route("/:id")
    .get(PigeonController.getPigeonDetails)
    .patch(fileUploadHandler(),auth( USER_ROLES.USER, USER_ROLES.PAIDUSER,USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), PigeonController.updatePigeon)
    .delete(auth( USER_ROLES.USER, USER_ROLES.PAIDUSER, USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN), PigeonController.deletePigeon)
router
  .route('/family/:id')

  .get(auth(USER_ROLES.ADMIN,USER_ROLES.PAIDUSER,USER_ROLES.USER,USER_ROLES.SUPER_ADMIN), PigeonController.getPigeonWithFamily);

router
  .route('/siblings/:id')
  
  .get(auth( USER_ROLES.PAIDUSER,USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN), PigeonController.getSiblingsController);

router
  .route('/my-pigeons/:id')
  .get( PigeonController.getMyPigeons);

router
  .route("/toggle/:id")
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), // only admin can toggle
    PigeonController.togglePigeonStatus
  );




  // Loft এ pigeon add করার জন্য
router.post(
  "/add",
  auth(USER_ROLES.PAIDUSER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  PigeonController.addToLoft
);

export const PigeonRoutes = router;