"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PigeonRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const pigeon_controller_1 = require("./pigeon.controller");
const fileUploaderHandler_1 = __importDefault(require("../../middlewares/fileUploaderHandler"));
// import { PigeonValidation } from "./pigeon.validation";
const validateFormData_1 = require("../../middlewares/validateFormData");
const pigeon_validation_1 = require("./pigeon.validation");
const router = express_1.default.Router();
router
    .route("/")
    .post((0, fileUploaderHandler_1.default)(), (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PAIDUSER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, validateFormData_1.validateFormData)(pigeon_validation_1.createPigeonZodSchema), pigeon_controller_1.PigeonController.createPigeon)
    .get(pigeon_controller_1.PigeonController.getAllPigeons)
    .get(pigeon_controller_1.PigeonController.getAllPigeonsAdmin);
router
    .route("/getAllPigeonsAdmin")
    .get(pigeon_controller_1.PigeonController.getAllPigeonsAdmin);
router
    .route("/export")
    .get((0, auth_1.default)(user_1.USER_ROLES.PAIDUSER), pigeon_controller_1.PigeonController.exportPigeonsPDF);
router
    .route("/import")
    .post((0, fileUploaderHandler_1.default)(), (0, auth_1.default)(user_1.USER_ROLES.PAIDUSER), pigeon_controller_1.PigeonController.importPigeons);
router
    .route("/search")
    .get(pigeon_controller_1.PigeonController.searchPigeonsByName);
router
    .route("/searchAll")
    .get(pigeon_controller_1.PigeonController.searchAllPigeonsByName);
router
    .route("/searchAllName")
    .get(pigeon_controller_1.PigeonController.searchAllName);
router
    .route('/myAllpigeons')
    // .get( authWithPageAccess('pigeon'), PigeonController.getMyAllPigeons);
    .get((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PAIDUSER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), pigeon_controller_1.PigeonController.getMyAllPigeons);
router
    .route("/:id")
    .get(pigeon_controller_1.PigeonController.getPigeonDetails)
    .patch((0, fileUploaderHandler_1.default)(), (0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PAIDUSER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), pigeon_controller_1.PigeonController.updatePigeon)
    .delete((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PAIDUSER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), pigeon_controller_1.PigeonController.deletePigeon);
router
    .route('/family/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.PAIDUSER, user_1.USER_ROLES.USER, user_1.USER_ROLES.SUPER_ADMIN), pigeon_controller_1.PigeonController.getPigeonWithFamily);
router
    .route('/siblings/:id')
    .get((0, auth_1.default)(user_1.USER_ROLES.PAIDUSER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), pigeon_controller_1.PigeonController.getSiblingsController);
router
    .route('/my-pigeons/:id')
    .get(pigeon_controller_1.PigeonController.getMyPigeons);
router
    .route("/toggle/:id")
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), // only admin can toggle
pigeon_controller_1.PigeonController.togglePigeonStatus);
// Loft এ pigeon add করার জন্য
router.post("/add", (0, auth_1.default)(user_1.USER_ROLES.PAIDUSER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), pigeon_controller_1.PigeonController.addToLoft);
exports.PigeonRoutes = router;
