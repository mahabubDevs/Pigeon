import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import config from "../../../config";
import {emailHelper }  from "../../../helpers/emailHelper";
import QueryBuilder from "../../../util/queryBuilder";
import { Subscription } from "../subscription/subscription.model";

interface GetAllUsersQuery {
  searchTerm?: string;
  sort?: string;
  page?: number;
  limit?: number;
  fields?: string;
  [key: string]: any;
}


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
        Hi ${createUser.name },
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
 
const getAllUsers = async (query: GetAllUsersQuery = {}): Promise<{
  users: any[];
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
}> => {
  // 1️⃣ Fetch users
  const builder = new QueryBuilder<IUser>(User.find({ role: { $ne: 'SUPER_ADMIN' } }), query)
    .search(['firstName', 'lastName', 'email', 'phoneNumber'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const users = await builder.modelQuery;
  const pagination = await builder.getPaginationInfo();

  // 2️⃣ Extract user IDs
  const userIds = users.map(u => u._id);

  // 3️⃣ Fetch active subscriptions
  const subscriptions = await Subscription.find({
    user: { $in: userIds },
    status: 'active'
  }).populate<{ package: { title?: string } }>('package', 'title'); // <-- note 'title'

  // 4️⃣ Map subscriptions to users
  const usersWithPlan = users.map(u => {
    const sub = subscriptions.find(s => s.user.toString() === u._id.toString());
    return {
      ...(typeof (u as any).toObject === 'function' ? (u as any).toObject() : u),
      currentPlan: sub && sub.package?.title ? sub.package.title : 'N/A'
    };
  });

  return { pagination, users: usersWithPlan };
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
  // যদি email update করতে চায় তাহলে আগে check করো
  if (payload.email) {
    const isEmailExist = await User.findOne({
      email: payload.email,
      _id: { $ne: id }, // নিজের user বাদ দিয়ে check করো
    });

    if (isEmailExist) {
      throw new ApiError(StatusCodes.CONFLICT, "Email already exists");
    }
  }

  // Update operation
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: payload }, // শুধু incoming payload fields update হবে
    { new: true, runValidators: true }
  );

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
  user.status = !user.status;
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
