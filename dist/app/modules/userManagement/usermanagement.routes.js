"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementRoutes = void 0;
const express_1 = __importDefault(require("express"));
const usermanagement_controller_1 = require("./usermanagement.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const authWithPageAccess_1 = require("../../middlewares/authWithPageAccess");
const router = express_1.default.Router();
//  User CRUD Admin Only
router
    .route("/")
    .post((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), usermanagement_controller_1.UserController.createUser)
    .get((0, authWithPageAccess_1.authWithPageAccess)('userManagement'), usermanagement_controller_1.UserController.getAllUsers);
router
    .route("/:id")
    .get((0, authWithPageAccess_1.authWithPageAccess)('userManagement'), usermanagement_controller_1.UserController.getSingleUser)
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), usermanagement_controller_1.UserController.updateUser)
    .delete((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), usermanagement_controller_1.UserController.deleteUser);
router
    .route("/active-inactive/:id")
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), usermanagement_controller_1.UserController.activeInactiveUser);
exports.UserManagementRoutes = router;
