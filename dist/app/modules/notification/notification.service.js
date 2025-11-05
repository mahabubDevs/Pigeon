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
exports.NotificationService = void 0;
const notification_model_1 = require("./notification.model");
const queryBuilder_1 = __importDefault(require("../../../util/queryBuilder"));
const user_model_1 = require("../user/user.model");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const createNotificationToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.create(payload);
    return result;
});
// get notifications
const getNotificationFromDB = (user_1, ...args_1) => __awaiter(void 0, [user_1, ...args_1], void 0, function* (user, query = {}) {
    // DB থেকে user আনো
    const dbUser = yield user_model_1.User.findById(user._id).select("createdAt");
    if (!dbUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
    }
    // সব notifications, newest first
    const builder = new queryBuilder_1.default(notification_model_1.Notification.find({
        receiver: { $in: [user._id] }, // receiver array check
        createdAt: { $gte: dbUser.createdAt }, // user register এর পর থেকে
    })
        .populate({
        path: "receiver",
        select: "name profile",
    })
        .sort({ createdAt: -1 }), // newest first
    query)
        .search(["text"])
        .filter()
        .paginate()
        .fields();
    const notifications = yield builder.modelQuery.exec();
    const pagination = yield builder.getPaginationInfo();
    // unread count optional, চাইলে রাখা যায়
    const unreadCount = yield notification_model_1.Notification.countDocuments({
        receiver: { $in: [user._id] },
        createdAt: { $gte: dbUser.createdAt },
        read: false,
    });
    return { pagination, notifications, unreadCount };
});
// read notifications only for user
const readNotificationToDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.updateMany({ receiver: user._id, read: false }, { $set: { read: true } });
    return result;
});
// get notifications for admin
const adminNotificationFromDB = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    // 1️⃣ Initialize QueryBuilder with ADMIN notifications
    const builder = new queryBuilder_1.default(notification_model_1.Notification.find({ type: 'ADMIN' }), query)
        .search(['text']) // searchable fields, adjust as needed
        .filter() // apply extra filters from query
        .sort() // sort by createdAt or query.sort
        .paginate() // page & limit from query
        .fields(); // select specific fields if query.fields exists
    // 2️⃣ Execute query
    const notification = yield builder.modelQuery.exec();
    // 3️⃣ Get pagination info
    const pagination = yield builder.getPaginationInfo();
    // 4️⃣ Return structured response
    return { pagination, notification };
});
const recentNotification = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    const builder = new queryBuilder_1.default(notification_model_1.Notification.find(), query)
        .search([])
        .paginate()
        .fields()
        .sort()
        .fields();
    const notification = yield builder.modelQuery.limit(4).exec();
    const pagination = yield builder.getPaginationInfo();
    const result = yield notification_model_1.Notification.find({ type: 'ADMIN' });
    return { pagination, notification };
});
// read notifications only for admin
const adminReadNotificationToDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.Notification.updateMany({ type: 'ADMIN', read: false }, { $set: { read: true } });
    return result;
});
const getUnreadCount = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const unreadCount = yield notification_model_1.Notification.countDocuments({
        receiver: user._id,
        read: false
    });
    return unreadCount;
});
exports.NotificationService = {
    createNotificationToDB,
    adminNotificationFromDB,
    getNotificationFromDB,
    readNotificationToDB,
    adminReadNotificationToDB,
    recentNotification,
    getUnreadCount
};
