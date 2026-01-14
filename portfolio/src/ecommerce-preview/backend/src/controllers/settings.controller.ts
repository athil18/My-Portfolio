import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import * as settingsService from '../services/settings.service';

export const changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Both passwords required');
    const result = await settingsService.changePassword(req.user.id, currentPassword, newPassword);
    sendResponse(res, httpStatus.OK, true, result.message);
});

export const updateNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const result = await settingsService.updateNotifications(req.user.id, req.body);
    sendResponse(res, httpStatus.OK, true, result.message, result.settings);
});

export const getSessions = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const result = await settingsService.getSessions(req.user.id);
    sendResponse(res, httpStatus.OK, true, 'Sessions fetched', result);
});

export const exportData = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const result = await settingsService.exportUserData(req.user.id);
    sendResponse(res, httpStatus.OK, true, 'Data exported', result);
});

export const deleteAccount = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { password } = req.body;
    if (!password) return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Password required');
    const result = await settingsService.deleteAccount(req.user.id, password);
    sendResponse(res, httpStatus.OK, true, result.message);
});

export const resendVerification = catchAsync(async (req: AuthRequest, res: Response) => {
    const { email } = req.body;
    if (!email) return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Email required');
    const result = await settingsService.resendVerification(email);
    sendResponse(res, httpStatus.OK, true, result.message);
});
