import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import config from "../../../config";
import {emailHelper }  from "../../../helpers/emailHelper";

const createUser = async (payload: IUser): Promise<IUser> => {
  try {
    // ইউজার তৈরি করা
    const { name, email, contact, password, role, pages } = payload;

    // ডুপ্লিকেট ইউজার চেক করা
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Email already exists!");
    }

    // পাসওয়ার্ড হ্যাশিং করা
    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    // ইউজার ক্রিয়েট করা
    const user = await User.create({
      name,
      email,
      contact,
      password: hashedPassword,
      role: role || "USER", // রোল ডিফল্ট USER হবে
      pages,
    });

    // রোল কাস্টম রোল হিসেবে অ্যাসাইন করা
    await assignRole(user._id.toString(), role);

    // পেজ অ্যাক্সেস অ্যাসাইন করা
    await assignPageAccess(user._id.toString(), pages ?? []);

    // ইমেইল পাঠানো
    const loginLink = `${config.frontendUrl}/login?userId=${user._id.toString()}`;
    const emailContent = `
      <h2>Welcome to Our Platform</h2>
      <p>Your account has been created successfully.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p>Click the link below to login and set your password:${password}</p>
      <a href="${loginLink}">Login</a>
    `;

    const emailValues = {
      to: email,
      subject: 'Account Created - Login Link',
      html: emailContent,
    };

    await emailHelper.sendEmail(emailValues);

    return user;
  } catch (error) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Error creating user: " + errorMessage);
  }
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
