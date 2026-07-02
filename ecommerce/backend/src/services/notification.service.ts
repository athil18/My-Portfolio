import { supabaseAdmin } from '../config/supabase';

/**
 * NOTIFICATION SERVICE — Supabase PostgreSQL Migration
 */

export const createNotification = async (
    userId: string,
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
    data?: Record<string, any>
) => {
    const { data: notification, error } = await supabaseAdmin
        .from('notifications')
        .insert({
            user_id: userId,
            type,
            title,
            message,
            data: data || {}
        })
        .select()
        .single();

    if (error) throw new Error('Failed to create notification');
    return { ...notification, _id: notification.id }; // mapping for api compat
};

export const getUserNotifications = async (
    userId: string,
    unreadOnly: boolean = false,
    page: number = 1,
    limit: number = 20
) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

    if (unreadOnly) {
        query = query.eq('is_read', false);
    }

    const { data: notifications, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw new Error('Failed to fetch notifications');

    const { count: unreadCount } = await supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    return {
        notifications: notifications.map(n => ({ ...n, _id: n.id })),
        total: count || 0,
        unreadCount: unreadCount || 0,
    };
};

export const getUnreadCount = async (userId: string): Promise<number> => {
    const { count, error } = await supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) return 0;
    return count || 0;
};

export const markAsRead = async (notificationId: string, userId: string) => {
    const { data: notification, error } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error || !notification) {
        throw new Error('Notification not found or unauthorized');
    }

    return { ...notification, _id: notification.id };
};

export const markAllAsRead = async (userId: string): Promise<number> => {
    const { error, count } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() }, { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) return 0;
    return count || 0;
};

export const deleteNotification = async (notificationId: string, userId: string): Promise<void> => {
    const { error, count } = await supabaseAdmin
        .from('notifications')
        .delete({ count: 'exact' })
        .eq('id', notificationId)
        .eq('user_id', userId);

    if (error || count === 0) {
        throw new Error('Notification not found or unauthorized');
    }
};

export const deleteAllRead = async (userId: string): Promise<number> => {
    const { error, count } = await supabaseAdmin
        .from('notifications')
        .delete({ count: 'exact' })
        .eq('user_id', userId)
        .eq('is_read', true);

    if (error) return 0;
    return count || 0;
};
