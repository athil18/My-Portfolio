import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import * as dashboardService from '../services/dashboard.service';

export const getStats = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const stats = await dashboardService.getDashboardStats(req.user.id);
    sendResponse(res, httpStatus.OK, true, 'Stats fetched', stats);
});

export const getActivity = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const activity = await dashboardService.getRecentActivity(req.user.id);
    sendResponse(res, httpStatus.OK, true, 'Activity fetched', activity);
});

export const getSummary = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const summary = await dashboardService.getDashboardSummary(req.user.id);
    sendResponse(res, httpStatus.OK, true, 'Summary fetched', summary);
});
