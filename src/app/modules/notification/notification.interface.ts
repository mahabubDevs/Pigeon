import { Model, Types } from 'mongoose';

export type INotification = {
    text: string;
    receiver?: Types.ObjectId[];
    read: boolean;
    referenceId?: string;
    screen?: "RESERVATION" | "CHAT";
    type?: "ADMIN" | "SUPER_ADMIN" | "USER" | "PAIDUSER";
    
};

export type NotificationModel = Model<INotification>;