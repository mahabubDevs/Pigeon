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
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    UserController.createUser
  )
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    UserController.getAllUsers
  );
// router
//   .route("/access")
//   .post(
//     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),  
//     UserController.createUserAndSendEmail  
//   )


router
  .route("/:id")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
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











// import { Request, Response, NextFunction } from 'express';
// import { USER_ROLES } from '../enums/user';
// import ApiError from '../errors/ApiErrors';
// import { StatusCodes } from 'http-status-codes';
// import { User } from '../app/modules/user/user.model';

// export const authorizeRoleOrPage = (page: string) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const user = req.user; // auth middleware থেকে attach করা user
    
//     if (!user) {
//       return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Not authenticated'));
//     }

//     // Role check
//     if ([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(user.role)) {
//       return next(); // access granted
//     }

//     // Page access check
//     const hasPageAccess = user.pages?.includes(page);
//     if (hasPageAccess) {
//       return next(); // access granted
//     }

//     // Role নেই, Page access নেই
//     return next(new ApiError(StatusCodes.FORBIDDEN, 'Access denied'));
//   };
// };
