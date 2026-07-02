import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import * as twoFactorService from '../services/twoFactor.service';
import { setTokenCookies } from '../utils/cookie';
import { redisConnection } from '../config/redis';
import { supabaseAdmin } from '../config/supabase';

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

    // Retrieve the temporarily cached Supabase session from Redis
    const sessionJson = await redisConnection.get(`mfa_session:${userId}`);
    if (!sessionJson) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'MFA session expired. Please log in again.');

    const session = JSON.parse(sessionJson);
    await redisConnection.del(`mfa_session:${userId}`);

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('name, email, role')
        .eq('id', userId)
        .single();

    if (!profile) return sendResponse(res, httpStatus.NOT_FOUND, false, 'User not found');

    await supabaseAdmin
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

    setTokenCookies(res, session.access_token, session.refresh_token);

    sendResponse(res, httpStatus.OK, true, '2FA verified. Login successful.', {
        user: { id: userId, email: profile.email, name: profile.name, role: profile.role }
    });
});

export const disable2FA = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { token } = req.body;
    if (!token) return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Token required');
    const result = await twoFactorService.disable2FA(req.user.id, token);
    sendResponse(res, httpStatus.OK, true, result.message);
});
