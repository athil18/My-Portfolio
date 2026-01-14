import User from '../models/user.model';
import UserProfile from '../models/userProfile.model';

export const getProfile = async (userId: string) => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new Error('User not found');
    }

    const profile = await UserProfile.findOne({ user: userId });

    return {
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            emailVerified: user.emailVerified,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
        },
        profile: profile || {},
    };
};

export const updateProfile = async (userId: string, updateData: any) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Update user fields if provided
    if (updateData.name) {
        user.name = updateData.name;
        await user.save();
    }

    // Update or create profile
    let profile = await UserProfile.findOne({ user: userId });

    if (!profile) {
        profile = await UserProfile.create({
            user: userId,
            ...updateData.profile,
        });
    } else {
        // Update profile fields
        Object.assign(profile, updateData.profile);
        await profile.save();
    }

    return {
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
        profile,
    };
};

export const updateAvatar = async (userId: string, avatarPath: string) => {
    let profile = await UserProfile.findOne({ user: userId });

    if (!profile) {
        profile = await UserProfile.create({
            user: userId,
            avatar: avatarPath,
        });
    } else {
        profile.avatar = avatarPath;
        await profile.save();
    }

    return profile;
};
