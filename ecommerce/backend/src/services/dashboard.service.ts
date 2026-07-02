import { supabaseAdmin } from '../config/supabase';

/**
 * DASHBOARD SERVICE — Supabase PostgreSQL Migration
 */

export const getDashboardStats = async (userId: string) => {
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (!profile) throw new Error('User not found');

    return {
        totalOrders: 0, // Mocked as in original
        activeOrders: 0,
        cartItems: 0,
        wishlistItems: 0,
        profileCompletion: calculateProfileCompletion(profile),
    };
};

export const getRecentActivity = async (userId: string) => {
    return {
        activities: [
            { id: '1', type: 'profile_update', message: 'Profile updated', createdAt: new Date() },
            { id: '2', type: 'login', message: 'Logged in successfully', createdAt: new Date(Date.now() - 3600000) },
        ],
    };
};

export const getDashboardSummary = async (userId: string) => {
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('name, email, role, last_login')
        .eq('id', userId)
        .single();

    if (!profile) throw new Error('User not found');

    const stats = await getDashboardStats(userId);
    const activity = await getRecentActivity(userId);

    return {
        user: { name: profile.name, email: profile.email, role: profile.role },
        stats,
        recentActivity: activity.activities.slice(0, 5),
        lastLogin: profile.last_login,
    };
};

const calculateProfileCompletion = (profile: any): number => {
    let completed = 0;
    const total = 6;

    if (profile.name) completed++;
    if (profile.email_verified) completed++;
    if (profile.phone) completed++;
    if (profile.bio) completed++;
    if (profile.avatar) completed++;
    if (profile.location_city) completed++;

    return Math.round((completed / total) * 100);
};
