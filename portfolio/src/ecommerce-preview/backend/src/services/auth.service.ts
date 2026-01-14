import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/user.model';
import RefreshToken from '../models/refreshToken.model';
import env from '../config/env';
import { validatePassword } from '../utils/passwordValidator';
import { emailService } from './external/email.service';
import { addEmailJob } from '../queues/email.queue';
import { AppError, AuthError, ValidationError } from '../utils/AppError';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const generateAccessToken = (userId: string): string => {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const generateRefreshToken = async (userId: string): Promise<string> => {
    const token = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

    await RefreshToken.create({
        user: userId,
        token,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    return token;
};

export const verifyAccessToken = (token: string): { userId: string } | null => {
    try {
        return jwt.verify(token, env.JWT_SECRET) as { userId: string };
    } catch {
        return null;
    }
};

export const verifyRefreshToken = (token: string): { userId: string } | null => {
    try {
        return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    } catch {
        return null;
    }
};

export const signup = async (email: string, password: string, name: string) => {
    // Validate password strength
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
        throw new ValidationError(passwordCheck.message);
    }

    // Check email uniqueness
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ValidationError('Email already registered');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
        email,
        password,
        name,
        verificationToken,
        verificationTokenExpiry,
        emailVerified: false,
    });

    // Send verification email
    try {
        await addEmailJob({
            type: 'verification',
            payload: { email: user.email, token: verificationToken, name: user.name }
        });
    } catch (error) {
        // If email fails, still allow signup but log the error
        console.error('Failed to send verification email:', error);
    }

    // Don't generate tokens yet - user needs to verify email first
    return {
        user: { id: user._id, email: user.email, name: user.name, role: user.role },
        message: 'Registration successful! Please check your email to verify your account.',
    };
};

export const verifyEmail = async (token: string) => {
    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpiry: { $gt: new Date() },
    }).select('+verificationToken +verificationTokenExpiry');

    if (!user) {
        throw new ValidationError('Invalid or expired verification token');
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Generate tokens after successful verification
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = await generateRefreshToken(user._id.toString());

    return {
        user: { id: user._id, email: user.email, name: user.name, role: user.role },
        accessToken,
        refreshToken,
        message: 'Email verified successfully!',
    };
};

export const login = async (email: string, password: string) => {
    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new AuthError('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
        throw new AuthError('Please verify your email before logging in');
    }

    // Check isActive
    if (!user.isActive) {
        throw new AuthError('Account is deactivated');
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AuthError('Invalid credentials');
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = await generateRefreshToken(user._id.toString());

    return {
        user: { id: user._id, email: user.email, name: user.name, role: user.role },
        accessToken,
        refreshToken,
    };
};

export const forgotPassword = async (email: string) => {
    const user = await User.findOne({ email });

    // Always return success message to prevent email enumeration
    if (!user) {
        return { message: 'If that email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Hash token before storing
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = resetPasswordExpiry;
    await user.save();

    // Send password reset email
    try {
        await addEmailJob({
            type: 'password-reset',
            payload: { email: user.email, token: resetToken, name: user.name }
        });
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        // Clear stored token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();
        throw new AppError('Failed to send password reset email. Please try again.', 500);
    }

    return { message: 'If that email exists, a reset link has been sent' };
};

export const resetPassword = async (token: string, newPassword: string) => {
    // Validate new password
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
        throw new ValidationError(passwordCheck.message);
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpiry');

    if (!user) {
        throw new ValidationError('Invalid or expired reset token');
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    // Send confirmation email
    try {
        await addEmailJob({
            type: 'password-reset-confirmation',
            payload: { email: user.email, name: user.name }
        });
    } catch (error) {
        console.error('Failed to send reset confirmation:', error);
    }

    return { message: 'Password reset successful' };
};

export const refreshAccessToken = async (refreshToken: string) => {
    // Verify token signature
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
        throw new AuthError('Invalid refresh token');
    }

    // Find and delete the old token atomically
    const storedToken = await RefreshToken.findOneAndDelete({ token: refreshToken });
    if (!storedToken) {
        // Token not found - could be reuse attempt
        // Revoke all tokens for this user as a security measure
        await RefreshToken.deleteMany({ user: payload.userId });
        throw new AuthError('Refresh token reuse detected - all sessions revoked');
    }

    // Check if token was expired in DB
    if (storedToken.expiresAt < new Date()) {
        throw new AuthError('Refresh token expired');
    }

    // Generate new token pair
    const accessToken = generateAccessToken(payload.userId);
    const newRefreshToken = await generateRefreshToken(payload.userId);

    return {
        accessToken,
        refreshToken: newRefreshToken
    };
};

export const revokeAllUserTokens = async (userId: string) => {
    const result = await RefreshToken.deleteMany({ user: userId });
    return { revokedCount: result.deletedCount };
};

export const logout = async (refreshToken: string) => {
    await RefreshToken.deleteOne({ token: refreshToken });
};
