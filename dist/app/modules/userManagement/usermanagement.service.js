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
const user_model_1 = require("../user/user.model");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const emailHelper_1 = require("../../../helpers/emailHelper");
const queryBuilder_1 = __importDefault(require("../../../util/queryBuilder"));
const subscription_model_1 = require("../subscription/subscription.model");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Create user with auto verified
    const createUser = yield user_model_1.User.create(Object.assign(Object.assign({}, payload), { verified: true }));
    if (!createUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    // 2. Send email with credentials
    const emailContent = `
        Hi ${createUser.name},
        Your account has been created.
        Email: ${createUser.email}
        Password: ${payload.password}   // user provided password
    `;
    yield emailHelper_1.emailHelper.sendEmail({
        to: createUser.email,
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
});
// Get All Users
const getAllUsers = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    // 1️⃣ Fetch users
    const builder = new queryBuilder_1.default(user_model_1.User.find({ role: { $ne: 'SUPER_ADMIN' }, verified: true }), query)
        .search(['firstName', 'lastName', 'email', 'phoneNumber'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const users = yield builder.modelQuery;
    const pagination = yield builder.getPaginationInfo();
    // 2️⃣ Extract user IDs
    const userIds = users.map(u => u._id);
    // 3️⃣ Fetch active subscriptions
    const subscriptions = yield subscription_model_1.Subscription.find({
        user: { $in: userIds },
        status: 'active'
    }).populate('package', 'title'); // <-- note 'title'
    // 4️⃣ Map subscriptions to users
    const usersWithPlan = users.map(u => {
        var _a;
        const sub = subscriptions.find(s => s.user.toString() === u._id.toString());
        return Object.assign(Object.assign({}, (typeof u.toObject === 'function' ? u.toObject() : u)), { currentPlan: sub && ((_a = sub.package) === null || _a === void 0 ? void 0 : _a.title) ? sub.package.title : 'N/A' });
    });
    return { users: usersWithPlan };
});
// Get Single User by ID
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
    }
    return user;
});
// Update User by ID
const updateUser = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // যদি email update করতে চায় তাহলে আগে check করো
    if (payload.email) {
        const isEmailExist = yield user_model_1.User.findOne({
            email: payload.email,
            _id: { $ne: id }, // নিজের user বাদ দিয়ে check করো
        });
        if (isEmailExist) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.CONFLICT, "Email already exists");
        }
    }
    // Update operation
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(id, { $set: payload }, // শুধু incoming payload fields update হবে
    { new: true, runValidators: true });
    if (!updatedUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to update user");
    }
    return updatedUser;
});
// Delete User by ID
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedUser = yield user_model_1.User.findByIdAndDelete(id);
    if (!deletedUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to delete user");
    }
    return deletedUser;
});
const activeInactiveUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
    }
    user.status = !user.status;
    console.log("user id");
    yield user.save();
    return user;
});
exports.UserService = {
    createUser,
    getAllUsers,
    getSingleUser,
    updateUser,
    deleteUser,
    activeInactiveUser
};
