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




 // Get All Users
 
const getAllUsers = async (): Promise<IUser[]> => {
  return await User.find();
};


 // Get Single User by ID

const getSingleUser = async (id: string): Promise<IUser | null> => {
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  return user;
};


 // Update User by ID

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


 // Delete User by ID

const deleteUser = async (id: string): Promise<IUser | null> => {
  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete user");
  }

  return deletedUser;
};

const activeInactiveUser = async (id: string): Promise<IUser | null> => {
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  user.verified = !user.verified;
  console.log("user id")
  await user.save();
  return user;
}


export const UserService = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  activeInactiveUser

};
