import User from '../models/user.model';

export const getAllUsers = async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments({ isActive: true });

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};

export const changeUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Prevent changing last admin
    if (user.role === 'admin' && newRole === 'user') {
        const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
        if (adminCount <= 1) {
            throw new Error('Cannot demote the last admin');
        }
    }

    user.role = newRole;
    await user.save();

    return {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
    };
};

export const deleteUser = async (userId: string, requestingUserId: string) => {
    if (userId === requestingUserId) {
        throw new Error('Cannot delete your own account');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Prevent deleting last admin
    if (user.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
        if (adminCount <= 1) {
            throw new Error('Cannot delete the last admin');
        }
    }

    user.isActive = false;
    await user.save();

    return { message: 'User deactivated successfully' };
};
