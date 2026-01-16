import Notification, { INotification } from '../models/notification.model';

/**
 * Create a notification
 */
export const createNotification = async (
    userId: string,
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
    data?: Record<string, any>
): Promise<INotification> => {
    const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
    });


    return notification;
};

/**
 * Get user's notifications with pagination
 */
export const getUserNotifications = async (
    userId: string,
    unreadOnly: boolean = false,
    page: number = 1,
    limit: number = 20
): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> => {
    const skip = (page - 1) * limit;
    const query: any = { userId };

    if (unreadOnly) {
        query.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Notification.countDocuments(query),
        Notification.countDocuments({ userId, isRead: false }),
    ]);

    return {
        notifications,
        total,
        unreadCount,
    };
};

/**
 * Get unread count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
    return Notification.countDocuments({ userId, isRead: false });
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string, userId: string): Promise<INotification | null> => {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        throw new Error('Notification not found or unauthorized');
    }

    return notification;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId: string): Promise<number> => {
    const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    return result.modifiedCount;
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string, userId: string): Promise<void> => {
    const result = await Notification.findOneAndDelete({ _id: notificationId, userId });

    if (!result) {
        throw new Error('Notification not found or unauthorized');
    }
};

/**
 * Delete all read notifications for a user
 */
export const deleteAllRead = async (userId: string): Promise<number> => {
    const result = await Notification.deleteMany({ userId, isRead: true });
    return result.deletedCount;
};
