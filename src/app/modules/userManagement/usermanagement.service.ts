import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import config from "../../../config";
import {emailHelper }  from "../../../helpers/emailHelper";



const createUser = async (payload: Partial<IUser>): Promise<IUser> => {
    // 1. Create user with auto verified
    const createUser = await User.create({
        ...payload,
        verified: true,   // auto verified
    });

    if (!createUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    // 2. Send email with credentials
    const emailContent = `
        Hi ${createUser.name || createUser.userName},
        Your account has been created.
        Email: ${createUser.email}
        Password: ${payload.password}   // user provided password
    `;
    await emailHelper.sendEmail({
        to: createUser.email!,
        subject: "Your account credentials",
        html: emailContent
    });

    // 3. Admin notification
    // await NotificationService.createNotificationToDB({
    //     text: `New user registered: ${createUser.name}`,
    //     type: 'ADMIN',
    //     read: false
    // });

    return createUser;
};


// রোল অ্যাসাইন করা
const assignRole = async (userId: string, role: string) => {
  const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!updatedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to assign role");
  }
};

// পেজ অ্যাক্সেস অ্যাসাইন করা
const assignPageAccess = async (userId: string, pages: string[]) => {
  const updatedUser = await User.findByIdAndUpdate(userId, { pages }, { new: true });
  if (!updatedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to assign page access");
  }
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


// -------------------------
// 🔹 Assign Role to User
// -------------------------


// const createUser = async (payload: Partial<IUser>): Promise<IUser> => {
//   const user = await User.create(payload);

//   if (!user) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
//   }

//   return user;
// };


// const assignRole = async (id: string, role: string): Promise<IUser | null> => {
//   const updatedUser = await User.findByIdAndUpdate({ _id: id }, { role }, { new: true });

//   if (!updatedUser) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to assign role");
//   }

//   return updatedUser;
// };

// // -------------------------
// // 🔹 Assign Page Access to User
// // -------------------------
// const assignPageAccess = async (id: string, pages: string[]): Promise<IUser | null> => {
//   const updatedUser = await User.findByIdAndUpdate({ _id: id }, { pages }, { new: true });

//   if (!updatedUser) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to assign page access");
//   }

//   return updatedUser;
// };

export const UserService = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,

//   assignRole,
//   assignPageAccess
};
