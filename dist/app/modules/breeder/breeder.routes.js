"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreederRoutes = void 0;
const express_1 = __importDefault(require("express"));
const breeder_controller_1 = require("./breeder.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const authWithPageAccess_1 = require("../../middlewares/authWithPageAccess");
const validateFormData_1 = require("../../middlewares/validateFormData");
const breeder_validation_1 = require("./breeder.validation");
const router = express_1.default.Router();
router
    .route("/")
    .post((0, authWithPageAccess_1.authWithPageAccess)('breeder'), (0, validateFormData_1.validateFormData)(breeder_validation_1.BreederValidation.createBreederZodSchema), breeder_controller_1.BreederController.createBreeder)
    .get((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PAIDUSER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), breeder_controller_1.BreederController.getAllBreeders);
router
    .route("/verify")
    .get((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PAIDUSER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), breeder_controller_1.BreederController.getVerifyAllBreeders);
router
    .route("/:id")
    .get((0, auth_1.default)(user_1.USER_ROLES.USER, user_1.USER_ROLES.PAIDUSER, user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), breeder_controller_1.BreederController.getBreederById)
    .patch((0, authWithPageAccess_1.authWithPageAccess)('breeder'), breeder_controller_1.BreederController.updateBreeder)
    .delete((0, authWithPageAccess_1.authWithPageAccess)('breeder'), breeder_controller_1.BreederController.deleteBreeder);
exports.BreederRoutes = router;
