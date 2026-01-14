import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import * as adminService from '../services/admin.service';

export const getAllUsers = catchAsync(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await adminService.getAllUsers(page, limit);
    sendResponse(res, httpStatus.OK, true, 'Users fetched successfully', result);
});

export const changeUserRole = catchAsync(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Invalid role');
    }

    const result = await adminService.changeUserRole(userId, role);
    sendResponse(res, httpStatus.OK, true, 'Role updated successfully', result);
});

export const deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;

    if (!req.user) {
        return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    }

    const result = await adminService.deleteUser(userId, req.user.id);
    sendResponse(res, httpStatus.OK, true, result.message);
});
