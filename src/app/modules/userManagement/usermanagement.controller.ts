import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./usermanagement.service";

// -------------------------
// 🔹 Create User (Register)
// -------------------------
const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "User created successfully",
    data: result,
  });
});

// -------------------------
// 🔹 Get All Users (Admin)
// -------------------------
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Users retrieved successfully",
    data: result,
  });
});

// -------------------------
// 🔹 Get Single User
// -------------------------
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getSingleUser(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User retrieved successfully",
    data: result,
  });
});

// -------------------------
// 🔹 Update User
// -------------------------
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateUser(req.params.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User updated successfully",
    data: result,
  });
});

// -------------------------
// 🔹 Delete User
// -------------------------
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await UserService.deleteUser(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User deleted successfully",
  });
});

// -------------------------
// 🔹 Assign Role
// -------------------------
const assignRole = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.assignRole(req.params.id, req.body.role);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Role assigned successfully",
    data: result,
  });
});

// -------------------------
// 🔹 Assign Page Access
// -------------------------
const assignPageAccess = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.assignPageAccess(req.params.id, req.body.pages);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Page access assigned successfully",
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  assignRole,
  assignPageAccess,
};
