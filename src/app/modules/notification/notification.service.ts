import { JwtPayload } from 'jsonwebtoken';
import { INotification } from './notification.interface';
import { Notification } from './notification.model';
import QueryBuilder from '../../../util/queryBuilder';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';


interface getAllNotification {
  searchTerm?: string;
  sort?: string;
  page?: number;
  limit?: number;
  fields?: string;
  [key: string]: any;
}

const createNotificationToDB = async (payload: INotification): Promise<INotification & { _id: Types.ObjectId }> => {
    const result = await Notification.create(payload);
    return result as INotification & { _id: Types.ObjectId };
};


// get notifications
const getNotificationFromDB = async (
  user: JwtPayload,
  query: getAllNotification = {}
) => {
  // DB থেকে user আনো
  const dbUser = await User.findById(user._id).select("createdAt");
  if (!dbUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  // সব notifications, newest first
  const builder = new QueryBuilder<INotification>(
    Notification.find({
      receiver: { $in: [user._id] }, // receiver array check
      createdAt: { $gte: dbUser.createdAt }, // user register এর পর থেকে
    })
      .populate({
        path: "receiver",
        select: "name profile",
      })
      .sort({ createdAt: -1 }), // newest first
    query
  )
    .search(["text"])
    .filter()
    .paginate()
    .fields();

  const notifications = await builder.modelQuery.exec();
  const pagination = await builder.getPaginationInfo();

  // unread count optional, চাইলে রাখা যায়
  const unreadCount = await Notification.countDocuments({
    receiver: { $in: [user._id] },
    createdAt: { $gte: dbUser.createdAt },
    read: false,
  });

  return { pagination, notifications, unreadCount };
};


// read notifications only for user
const readNotificationToDB = async ( user: JwtPayload): Promise<INotification | undefined> => {

    const result: any = await Notification.updateMany(
        { receiver: user._id, read: false },
        { $set: { read: true } }
    );
    return result;
};

// get notifications for admin
const adminNotificationFromDB = async (
  query: getAllNotification = {}
): Promise<{
  notification: INotification[];
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
}> => {
  
  // 1️⃣ Initialize QueryBuilder with ADMIN notifications
  const builder = new QueryBuilder<INotification>(
    Notification.find({ type: 'ADMIN' }),
    query
  )
    .search(['text'])  // searchable fields, adjust as needed
    .filter()          // apply extra filters from query
    .sort()            // sort by createdAt or query.sort
    .paginate()        // page & limit from query
    .fields();         // select specific fields if query.fields exists

  // 2️⃣ Execute query
  const notification = await builder.modelQuery.exec();

  // 3️⃣ Get pagination info
  const pagination = await builder.getPaginationInfo();

  // 4️⃣ Return structured response
  return { pagination, notification };
};


const recentNotification = async (query:getAllNotification = {}): Promise<{
    notification: INotification[];
    pagination: {
        total: number;
        limit: number;
        page: number;
        totalPage: number;
    }
}> => {

    const builder = new QueryBuilder<INotification>(Notification.find(),query)
    .search([])
    .paginate()
    .fields()
    .sort()
    .fields();

   
    const notification = await builder.modelQuery.limit(4).exec();
    const pagination = await builder.getPaginationInfo();
    const result = await Notification.find({ type: 'ADMIN' });
    return {pagination, notification}
};

// read notifications only for admin
const adminReadNotificationToDB = async (): Promise<INotification | null> => {
    const result: any = await Notification.updateMany(
        { type: 'ADMIN', read: false },
        { $set: { read: true } }
    );
    return result;
};




const getUnreadCount = async (user: JwtPayload): Promise<number> => {
    const unreadCount = await Notification.countDocuments({
        receiver: user._id,
        read: false
    });
    return unreadCount;
};

export const NotificationService = {
    createNotificationToDB,
    adminNotificationFromDB,
    getNotificationFromDB,
    readNotificationToDB,
    adminReadNotificationToDB,
    recentNotification,
    getUnreadCount
};
