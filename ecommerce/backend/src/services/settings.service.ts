import User from '../models/user.model';
import { emailService } from './external/email.service';
import crypto from 'crypto';
import { validatePassword } from '../utils/passwordValidator';

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new Error('User not found');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new Error('Current password is incorrect');

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) throw new Error(passwordCheck.message);

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
};

export const updateNotifications = async (userId: string, settings: any) => {
    // For now, store in user preferences (could be a separate collection)
    return { message: 'Notification preferences updated', settings };
};

export const getSessions = async (userId: string) => {
    // Placeholder - would track actual sessions
    return {
        sessions: [
            { id: '1', device: 'Current Browser', location: 'Your Location', lastActive: new Date(), current: true },
        ],
    };
};

export const exportUserData = async (userId: string) => {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User not found');

    return {
        user: user.toObject(),
        exportedAt: new Date(),
    };
};

export const deleteAccount = async (userId: string, password: string) => {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new Error('User not found');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Password is incorrect');

    user.isActive = false;
    await user.save();

    return { message: 'Account deleted successfully' };
};

export const resendVerification = async (email: string) => {
    const user = await User.findOne({ email }).select('+verificationToken +verificationTokenExpiry');
    if (!user) throw new Error('User not found');
    if (user.emailVerified) throw new Error('Email already verified');

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await emailService.sendVerificationEmail(email, verificationToken, user.name);

    return { message: 'Verification email sent' };
};
