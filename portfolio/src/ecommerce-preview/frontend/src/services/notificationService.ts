import apiClient from './api';

export interface Notification {
    _id: string;
    userId: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    data?: Record<string, any>;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export const notificationService = {
    /**
     * Get user's notifications
     */
    getNotifications: async (unreadOnly: boolean = false, page: number = 1, limit: number = 20) => {
        const response = await apiClient.get('/notifications', {
            params: { unreadOnly, page, limit },
        });
        return response.data;
    },

    /**
     * Get unread count
     */
    getUnreadCount: async (): Promise<number> => {
        const response = await apiClient.get('/notifications/unread-count');
        return response.data.data.count;
    },

    /**
     * Mark notification as read
     */
    markAsRead: async (id: string): Promise<Notification> => {
        const response = await apiClient.patch(`/notifications/${id}/read`);
        return response.data.data;
    },

    /**
     * Mark all as read
     */
    markAllAsRead: async (): Promise<{ count: number }> => {
        const response = await apiClient.patch('/notifications/read-all');
        return response.data.data;
    },

    /**
     * Delete notification
     */
    deleteNotification: async (id: string): Promise<void> => {
        await apiClient.delete(`/notifications/${id}`);
    },
};
