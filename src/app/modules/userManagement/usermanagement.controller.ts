import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./usermanagement.service";
import config from "../../../config";
import bcrypt from "bcrypt";
import  {emailHelper }  from "../../../helpers/emailHelper";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";

// -------------------------
// 🔹 Create User (Register)
// -------------------------


const createUser = catchAsync(async (req: Request, res: Response) => {
    const userData = req.body;
    const result = await UserService.createUser(userData);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User created successfully. Check email for credentials.',
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

// const createUserAndSendEmail = catchAsync(async (req: Request, res: Response) => {
//   const { name, email, contact, password, role, pages, location, appId } = req.body;

//   try {
//     // ইউজার তৈরি করা (পাসওয়ার্ড হ্যাশিং, ইমেইল চেকিং ইত্যাদি স্কিমা লেভেলে হবে)
//     const user = await User.create({
//       name,
//       email,
//       contact,
//       password,  // পাসওয়ার্ড স্কিমা লেভেলে হ্যাশ হবে
//       role: role || "USER",  // ডিফল্ট রোল 'USER'
//       pages,
//     });

//     // রোল কাস্টম রোল হিসেবে অ্যাসাইন করা
//     await UserService.assignRole(user._id.toString(), role);

//     // পেজ অ্যাক্সেস অ্যাসাইন করা
//     await UserService.assignPageAccess(user._id.toString(), pages);

//     // লগইন লিঙ্ক তৈরি করা
//     const loginLink = `${config.frontendUrl}/login?userId=${user._id.toString()}`;

//     // ইমেইল কন্টেন্ট তৈরি করা
//     const emailContent = `
//       <h2>Welcome to Our Platform</h2>
//       <p>Your account has been created successfully.</p>
//       <p><strong>Email:</strong> ${email}</p>
//       <p>Click the link below to login and set your password:${password}</p>
//       <a href="${loginLink}">Login</a>
//     `;

//     // ইমেইল পাঠানোর জন্য তথ্য তৈরি করা
//     const emailValues = {
//       to: email,
//       subject: 'Account Created - Login Link',
//       html: emailContent,
//     };

//     // ইমেইল পাঠানো
//     // const emailResponse = await emailHelper.sendEmail(emailValues);

//     // কনসোলে সফল ইমেইল পাঠানোর মেসেজ লগ করা
//     try {
//   const emailResponse = await emailHelper.sendEmail(emailValues);
//   console.log("Email sent successfully:", emailResponse);
// } catch (error) {
//   console.error("Error sending email:", error);
// }


//     // ইউজার তৈরি সফল হলে প্রতিক্রিয়া পাঠানো
//     sendResponse(res, {
//       success: true,
//       statusCode: StatusCodes.CREATED,
//       message: "User created successfully and email sent.",
//       data: user,
//     });
//   } catch (error) {
//     // কনসোলে ত্রুটি লগ করা
//     console.error("Error in creating user or sending email:", error);
//     sendResponse(res, {
//       success: false,
//       statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//       message: "An error occurred while creating the user or sending email.",
//     });
//   }
// });




// -------------------------

export const UserController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
 
//   createUserAndSendEmail
};
