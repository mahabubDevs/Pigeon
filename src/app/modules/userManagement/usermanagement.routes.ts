import express from "express";
import { UserController } from "./usermanagement.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { authWithPageAccess } from "../../middlewares/authWithPageAccess";

const router = express.Router();

// --------------------
// 🔹 User CRUD (Admin Only)
// --------------------
router
  .route("/")
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    UserController.createUser
  )
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    UserController.getAllUsers
  );


router
  .route("/:id")
  .get(
    authWithPageAccess('userManagement'),
    UserController.getSingleUser
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    UserController.updateUser
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    UserController.deleteUser
  );

// --------------------
// 🔹 Role & Page Access Management
// --------------------

export const UserManagementRoutes = router;











