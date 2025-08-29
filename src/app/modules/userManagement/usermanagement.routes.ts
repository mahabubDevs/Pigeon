import express from "express";
import { UserController } from "./usermanagement.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

// --------------------
// 🔹 User CRUD (Admin Only)
// --------------------
router
  .route("/")
  .post(
    auth(USER_ROLES.ADMIN),
    UserController.createUser
  )
  .get(
    auth(USER_ROLES.ADMIN),
    UserController.getAllUsers
  );

router
  .route("/:id")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    UserController.getSingleUser
  )
  .patch(
    auth(USER_ROLES.ADMIN),
    UserController.updateUser
  )
  .delete(
    auth(USER_ROLES.ADMIN),
    UserController.deleteUser
  );

// --------------------
// 🔹 Role & Page Access Management
// --------------------
router.patch(
  "/:id/role",
  auth(USER_ROLES.ADMIN),
  UserController.assignRole
);

router.patch(
  "/:id/access",
  auth(USER_ROLES.ADMIN),
  UserController.assignPageAccess
);

export const UserManagementRoutes = router;
