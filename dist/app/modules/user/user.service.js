"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("./user.model");
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const emailTemplate_1 = require("../../../shared/emailTemplate");
const emailHelper_1 = require("../../../helpers/emailHelper");
const unlinkFile_1 = __importDefault(require("../../../shared/unlinkFile"));
const notification_service_1 = require("../notification/notification.service");
const pigeon_model_1 = require("../pigeon/pigeon.model");
const subscription_model_1 = require("../subscription/subscription.model");
const createAdminToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // check admin is exist or not;
    const isExistAdmin = yield user_model_1.User.findOne({ email: payload.email });
    if (isExistAdmin) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.CONFLICT, "This Email already taken");
    }
    // create admin to db
    const createAdmin = yield user_model_1.User.create(payload);
    if (!createAdmin) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Admin');
    }
    else {
        yield user_model_1.User.findByIdAndUpdate({ _id: createAdmin === null || createAdmin === void 0 ? void 0 : createAdmin._id }, { verified: true }, { new: true });
    }
    return createAdmin;
});
const createUserToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Capitalize each word of the user's name
    if (payload.name) {
        payload.name = payload.name
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    }
    const createUser = yield user_model_1.User.create(payload);
    console.log("Created User:", createUser);
    if (!createUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    //send email
    const otp = (0, generateOTP_1.default)();
    const values = {
        name: createUser.name,
        otp: otp,
        email: createUser.email
    };
    // console.log(values);
    const createAccountTemplate = emailTemplate_1.emailTemplate.createAccount(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };
    yield user_model_1.User.findOneAndUpdate({ _id: createUser._id }, { $set: { authentication } });
    const admins = yield user_model_1.User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } }).select('_id');
    for (const admin of admins) {
        yield notification_service_1.NotificationService.createNotificationToDB({
            text: `New user registered: ${createUser.name}`,
            type: 'ADMIN',
            receiver: [admin._id], // ✅ array of ObjectId, schema compatible
            read: false
        });
    }
    return createUser;
});
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
const getUserProfileFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { _id } = user;
    // Check if user exists
    const isExistUser = yield user_model_1.User.isExistUserById(_id);
    if (!isExistUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    // Count total pigeons created by this user
    const totalPigeons = yield pigeon_model_1.Pigeon.countDocuments({ user: _id, name: { $exists: true, $ne: "" } });
    // Find active subscription (if exists)
    const subscription = yield subscription_model_1.Subscription.findOne({
        user: _id,
        // status: "active",
    })
        .populate("package", "title  price") // package details আনতে চাইলে
        .sort({ createdAt: -1 });
    return Object.assign(Object.assign({}, isExistUser.toObject()), { totalPigeons, subscription: subscription
            ? {
                package: ((_a = subscription.package) === null || _a === void 0 ? void 0 : _a.title) || "Unknown",
                startDate: subscription.currentPeriodStart,
                endDate: subscription.currentPeriodEnd,
                status: subscription.status,
            }
            : null });
});
const updateProfileToDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = user;
    const isExistUser = yield user_model_1.User.isExistUserById(_id);
    if (!isExistUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    //unlink file here
    if (payload.profile) {
        (0, unlinkFile_1.default)(isExistUser.profile);
    }
    const updateDoc = yield user_model_1.User.findOneAndUpdate({ _id: _id }, payload, { new: true });
    return updateDoc;
});
exports.UserService = {
    createUserToDB,
    getUserProfileFromDB,
    updateProfileToDB,
    createAdminToDB
};
