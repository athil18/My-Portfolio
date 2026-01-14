import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';

/**
 * Create notification (admin only)
 */
export const createNotification = async (req: Request, res: Response) => {
    try {
        const { userId, type, title, message, data } = req.body;

        const notification = await notificationService.createNotification(userId, type, title, message, data);

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create notification',
        });
    }
};

/**
 * Get user's notifications
 */
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { unreadOnly, page = 1, limit = 20 } = req.query;

        const result = await notificationService.getUserNotifications(
            userId,
            unreadOnly === 'true',
            Number(page),
            Number(limit)
        );

        res.json({
            success: true,
            data: result.notifications,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: result.total,
                pages: Math.ceil(result.total / Number(limit)),
            },
            unreadCount: result.unreadCount,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch notifications',
        });
    }
};

/**
 * Get unread count
 */
export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const count = await notificationService.getUnreadCount(userId);

        res.json({
            success: true,
            data: { count },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get unread count',
        });
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;

        const notification = await notificationService.markAsRead(id, userId);

        res.json({
            success: true,
            message: 'Notification marked as read',
            data: notification,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to mark as read',
        });
    }
};

/**
 * Mark all as read
 */
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const count = await notificationService.markAllAsRead(userId);

        res.json({
            success: true,
            message: `${count} notifications marked as read`,
            data: { count },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to mark all as read',
        });
    }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;

        await notificationService.deleteNotification(id, userId);

        res.json({
            success: true,
            message: 'Notification deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete notification',
        });
    }
};
