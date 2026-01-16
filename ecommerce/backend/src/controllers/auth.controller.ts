import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import * as authService from '../services/auth.service';

const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

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
    setTokenCookies(res, result.accessToken, result.refreshToken);
    sendResponse(res, httpStatus.OK, true, 'Login successful', { user: result.user });
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
