import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";

/**
 * Create User
 */
const createUser = async (payload: Partial<IUser>): Promise<IUser> => {
  const user = await User.create(payload);

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
  }

  return user;
};

/**
 * Get All Users
 */
const getAllUsers = async (): Promise<IUser[]> => {
  return await User.find();
};

/**
 * Get Single User by ID
 */
const getSingleUser = async (id: string): Promise<IUser | null> => {
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  return user;
};

/**
 * Update User by ID
 */
const updateUser = async (
  id: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {
  const updatedUser = await User.findByIdAndUpdate(id, payload, { new: true });

  if (!updatedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update user");
  }

  return updatedUser;
};

/**
 * Delete User by ID
 */
const deleteUser = async (id: string): Promise<IUser | null> => {
  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete user");
  }

  return deletedUser;
};

/**
 * Assign Role to User
 */
const assignRole = async (id: string, role: string): Promise<IUser | null> => {
  const updatedUser = await User.findByIdAndUpdate({ _id: id }, { role }, { new: true });

  if (!updatedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to assign role");
  }

  return updatedUser;
};

/**
 * Assign Page Access to User
 */
const assignPageAccess = async (
  id: string,
  pages: string[]
): Promise<IUser | null> => {
  const updatedUser = await User.findByIdAndUpdate({ _id: id }, { pages }, { new: true });

  if (!updatedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to assign page access");
  }

  return updatedUser;
};

export const UserService = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  assignRole,
  assignPageAccess,
};
