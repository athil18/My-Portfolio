import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import * as authService from '../services/auth.service';
import { setTokenCookies } from '../utils/cookie';

export const signup = catchAsync(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Email, password, and name are required');
    }

    const result = await authService.signup(email, password, name);
    sendResponse(res, httpStatus.CREATED, true, result.message, { user: result.user });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Verification token is required');
    }

    const result = await authService.verifyEmail(token);
    setTokenCookies(res, result.accessToken, result.refreshToken);
    sendResponse(res, httpStatus.OK, true, result.message, {
        user: result.user,
    });
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Email and password are required');
    }

    const result = await authService.login(email, password);

    if ('requires2FA' in result && result.requires2FA) {
        return sendResponse(res, httpStatus.OK, true, '2FA verification required', {
            requires2FA: true,
            userId: result.userId,
        });
    }

    // Since we know requires2FA is false, cast and read token
    const authResult = result as { user: any; accessToken: string; refreshToken: string };
    setTokenCookies(res, authResult.accessToken, authResult.refreshToken);
    sendResponse(res, httpStatus.OK, true, 'Login successful', { user: authResult.user });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Email is required');
    }

    const result = await authService.forgotPassword(email);
    sendResponse(res, httpStatus.OK, true, result.message);
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Token and new password are required');
    }

    const result = await authService.resetPassword(token, newPassword);
    sendResponse(res, httpStatus.OK, true, result.message);
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Refresh token is required');
    }

    const result = await authService.refreshAccessToken(refreshToken);

    setTokenCookies(res, result.accessToken, result.refreshToken);
    sendResponse(res, httpStatus.OK, true, 'Token refreshed', {});
});

export const logout = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        await authService.logout(refreshToken);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    sendResponse(res, httpStatus.OK, true, 'Logged out successfully');
});
