import { JwtPayload } from 'jsonwebtoken';
import { INotification } from './notification.interface';
import { Notification } from './notification.model';
import QueryBuilder from '../../../util/queryBuilder';


interface getAllNotification {
  searchTerm?: string;
  sort?: string;
  page?: number;
  limit?: number;
  fields?: string;
  [key: string]: any;
}

const createNotificationToDB = async (payload: INotification): Promise<INotification> => {
    const result = await Notification.create(payload);
    return result;
};

// get notifications
const getNotificationFromDB = async ( user: JwtPayload ): Promise<INotification> => {

    const result = await Notification.find({ receiver: user.id }).populate({
        path: 'sender',
        select: 'name profile',
    });

    const unreadCount = await Notification.countDocuments({
        receiver: user.id,
        read: false,
    });

    const data: any = {
        result,
        unreadCount
    };

  return data;
};

// read notifications only for user
const readNotificationToDB = async ( user: JwtPayload): Promise<INotification | undefined> => {

    const result: any = await Notification.updateMany(
        { receiver: user.id, read: false },
        { $set: { read: true } }
    );
    return result;
};

// get notifications for admin
const adminNotificationFromDB = async (query:getAllNotification = {}): Promise<{
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
    .fields();

    const notification = await builder.modelQuery;
    const pagination = await builder.getPaginationInfo();
    const result = await Notification.find({ type: 'ADMIN' });
    return {pagination, notification}
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
        receiver: user.id,
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
