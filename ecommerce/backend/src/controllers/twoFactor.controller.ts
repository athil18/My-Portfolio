import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import * as twoFactorService from '../services/twoFactor.service';
import User from '../models/user.model';
import { generateAccessToken, generateRefreshToken } from '../services/auth.service';
import { setTokenCookies } from '../utils/cookie';

export const setup2FA = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const result = await twoFactorService.setup2FA(req.user.id);
    sendResponse(res, httpStatus.OK, true, '2FA setup initiated', result);
});

export const verifySetup = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { token } = req.body;
    if (!token) return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Token required');
    const result = await twoFactorService.verifyAndEnable2FA(req.user.id, token);
    sendResponse(res, httpStatus.OK, true, result.message, { backupCodes: result.backupCodes });
});

export const verifyLogin = catchAsync(async (req: AuthRequest, res: Response) => {
    const { userId, token } = req.body;
    if (!userId || !token) return sendResponse(res, httpStatus.BAD_REQUEST, false, 'UserId and token required');
    
    const isValid = await twoFactorService.verify2FAToken(userId, token);
    if (!isValid) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Invalid 2FA code');

    const user = await User.findById(userId);
    if (!user) return sendResponse(res, httpStatus.NOT_FOUND, false, 'User not found');

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = await generateRefreshToken(user._id.toString());

    setTokenCookies(res, accessToken, refreshToken);

    sendResponse(res, httpStatus.OK, true, '2FA verified. Login successful.', {
        user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
});

export const disable2FA = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { token } = req.body;
    if (!token) return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Token required');
    const result = await twoFactorService.disable2FA(req.user.id, token);
    sendResponse(res, httpStatus.OK, true, result.message);
});
