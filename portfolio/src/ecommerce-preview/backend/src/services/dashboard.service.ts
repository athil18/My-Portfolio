import User from '../models/user.model';
import UserProfile from '../models/userProfile.model';

export const getDashboardStats = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const profile = await UserProfile.findOne({ user: userId });

    return {
        totalOrders: 0,
        activeOrders: 0,
        cartItems: 0,
        wishlistItems: 0,
        profileCompletion: calculateProfileCompletion(user, profile),
    };
};

export const getRecentActivity = async (userId: string) => {
    // Placeholder for activity tracking - returns sample data
    return {
        activities: [
            { id: '1', type: 'profile_update', message: 'Profile updated', createdAt: new Date() },
            { id: '2', type: 'login', message: 'Logged in successfully', createdAt: new Date(Date.now() - 3600000) },
        ],
    };
};

export const getDashboardSummary = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const stats = await getDashboardStats(userId);
    const activity = await getRecentActivity(userId);

    return {
        user: { name: user.name, email: user.email, role: user.role },
        stats,
        recentActivity: activity.activities.slice(0, 5),
        lastLogin: user.lastLogin,
    };
};

const calculateProfileCompletion = (user: any, profile: any): number => {
    let completed = 0;
    const total = 6;

    if (user.name) completed++;
    if (user.emailVerified) completed++;
    if (profile?.phone) completed++;
    if (profile?.bio) completed++;
    if (profile?.avatar) completed++;
    if (profile?.location?.city) completed++;

    return Math.round((completed / total) * 100);
};
