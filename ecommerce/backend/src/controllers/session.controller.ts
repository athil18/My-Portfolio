import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import * as sessionService from '../services/session.service';

export const getSessions = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
    const sessions = await sessionService.getUserSessions(req.user.id, refreshToken);
    sendResponse(res, httpStatus.OK, true, 'Sessions fetched', { sessions });
});

export const deleteSession = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { sessionId } = req.params;
    const result = await sessionService.deleteSession(req.user.id, sessionId);
    sendResponse(res, httpStatus.OK, true, result.message);
});

export const deleteAllSessions = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
    const result = await sessionService.deleteAllSessions(req.user.id, refreshToken);
    sendResponse(res, httpStatus.OK, true, result.message);
});
