import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import * as userService from '../services/user.service';

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    }

    const profileData = await userService.getProfile(req.user.id);
    sendResponse(res, httpStatus.OK, true, 'Profile fetched successfully', profileData);
});

export const updateMe = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    }

    const result = await userService.updateProfile(req.user.id, req.body);
    sendResponse(res, httpStatus.OK, true, 'Profile updated successfully', result);
});

export const updateAvatar = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    }

    if (!req.file) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'No file uploaded');
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const profile = await userService.updateAvatar(req.user.id, avatarPath);

    sendResponse(res, httpStatus.OK, true, 'Avatar updated successfully', { avatar: profile.avatar });
});
