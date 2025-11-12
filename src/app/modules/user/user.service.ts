import { USER_ROLES } from "../../../enums/user";
import { IUser } from "./user.interface";
import { JwtPayload } from 'jsonwebtoken';
import { User } from "./user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import generateOTP from "../../../util/generateOTP";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailHelper } from "../../../helpers/emailHelper";
import unlinkFile from "../../../shared/unlinkFile";
import { NotificationService } from "../notification/notification.service";
import { Pigeon } from "../pigeon/pigeon.model";
import { Subscription } from "../subscription/subscription.model";

const createAdminToDB = async (payload: any): Promise<IUser> => {

    // check admin is exist or not;
    const isExistAdmin = await User.findOne({ email: payload.email })
    if (isExistAdmin) {
        throw new ApiError(StatusCodes.CONFLICT, "This Email already taken");
    }

    // create admin to db
    const createAdmin = await User.create(payload);
    if (!createAdmin) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Admin');
    } else {
        await User.findByIdAndUpdate({ _id: createAdmin?._id }, { verified: true }, { new: true });
    }

    return createAdmin;
}

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {

  // Capitalize each word of the user's name
  if (payload.name) {
    payload.name = payload.name
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }


    const createUser = await User.create(payload);
    console.log("Created User:", createUser);
    if (!createUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }

    //send email
    const otp = generateOTP();
    const values = {
        name: createUser.name,
        otp: otp,
        email: createUser.email!
    };
    // console.log(values);

    const createAccountTemplate = emailTemplate.createAccount(values);
    emailHelper.sendEmail(createAccountTemplate);
    

    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };

    await User.findOneAndUpdate(
        { _id: createUser._id },
        { $set: { authentication } }
    );

const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } }).select('_id');

for (const admin of admins) {
  await NotificationService.createNotificationToDB({
    text: `New user registered: ${createUser.name}`,
    type: 'ADMIN',
    receiver: [admin._id], // ✅ array of ObjectId, schema compatible
    read: false
  });
}


return createUser;
}



// const getUserProfileFromDB = async (user: JwtPayload): Promise<Partial<IUser> & { totalPigeons: number }> => {
//     const { _id } = user;

//     // Check if user exists
//     const isExistUser: any = await User.isExistUserById(_id);
//     if (!isExistUser) {
//         throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
//     }

//     // Count total pigeons created by this user
//     const totalPigeons = await Pigeon.countDocuments({ user: _id });

//     console.log("total pigeon", totalPigeons);

//     return {
//         ...isExistUser.toObject(), // mongoose document to plain object
//         // contact: isExistUser.contact,
//         totalPigeons
//     };
// };


const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<
  Partial<IUser> & {
    totalPigeons: number;
    subscription?: {
      package: string;
      startDate: Date;
      endDate: Date;
      status: string;
    } | null;
  }
> => {
  const { _id } = user;

  // Check if user exists
  const isExistUser: any = await User.isExistUserById(_id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Count total pigeons created by this user
  const totalPigeons = await Pigeon.countDocuments({ user: _id, name: { $exists: true, $ne: "" } });

  // Find active subscription (if exists)
  const subscription = await Subscription.findOne({
    user: _id,
    // status: "active",
  })
    .populate("package", "title  price") // package details আনতে চাইলে
    .sort({ createdAt: -1 });

  return {
    ...isExistUser.toObject(),
    totalPigeons,
    subscription: subscription
  ? {
      package: (subscription.package as any)?.title || "Unknown",
      startDate: subscription.currentPeriodStart,
      endDate: subscription.currentPeriodEnd,
      status: subscription.status,
 
    }
  : null,
  };
};


const updateProfileToDB = async (user: JwtPayload, payload: Partial<IUser>): Promise<Partial<IUser | null>> => {
    const { _id } = user;
    const isExistUser = await User.isExistUserById(_id);
    if (!isExistUser) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    //unlink file here
    if (payload.profile) {
        unlinkFile(isExistUser.profile);
    }

    const updateDoc = await User.findOneAndUpdate(
        { _id: _id },
        payload,
        { new: true }
    );
    return updateDoc;
};




export const UserService = {
    createUserToDB,
    getUserProfileFromDB,
    updateProfileToDB,
    createAdminToDB
};