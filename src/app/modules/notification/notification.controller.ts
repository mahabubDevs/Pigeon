import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { NotificationService } from './notification.service';
import ApiError from '../../../errors/ApiErrors';

const getNotificationFromDB = catchAsync( async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found');
    }

    const result = await NotificationService.getNotificationFromDB(user, req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notifications Retrieved Successfully',
        data: result,
    });
  }
);

const adminNotificationFromDB = catchAsync( async (req: Request, res: Response) => {
    const result = await NotificationService.adminNotificationFromDB(req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notifications Retrieved Successfully',
        data: result
    });
});
const recentNotification = catchAsync( async (req: Request, res: Response) => {
    const result = await NotificationService.recentNotification();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notifications Retrieved Successfully',
        data: result
    });
});

const readNotification = catchAsync(async (req: Request, res: Response) => {

    const user = req.user;
    if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found');
    }
    const result = await NotificationService.readNotificationToDB(user);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notification Read Successfully',
        data: result
    });
});

const adminReadNotification = catchAsync( async (req: Request, res: Response) => {
    const result = await NotificationService.adminReadNotificationToDB();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notification Read Successfully',
        data: result
    });
});


const unreadNotificationCount = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found');
    }

    const unreadCount = await NotificationService.getUnreadCount();

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Unread Notification Count Retrieved Successfully',
        data: { unreadCount }
    });
});


export const NotificationController = {
    adminNotificationFromDB,
    getNotificationFromDB,
    readNotification,
    adminReadNotification,
    recentNotification,
    unreadNotificationCount
};
