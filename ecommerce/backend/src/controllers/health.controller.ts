import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import * as healthService from '../services/health.service';

export const checkHealth = catchAsync(async (req: Request, res: Response) => {
    const healthData = await healthService.getHealthStatus();
    const statusCode = healthData.status === 'critical' ? httpStatus.SERVICE_UNAVAILABLE : httpStatus.OK;
    sendResponse(res, statusCode, healthData.status !== 'critical', 'Health check complete', healthData);
});

export const checkReady = catchAsync(async (req: Request, res: Response) => {
    const isReady = await healthService.isReady();
    if (isReady) {
        sendResponse(res, httpStatus.OK, true, 'Service is ready');
    } else {
        sendResponse(res, httpStatus.SERVICE_UNAVAILABLE, false, 'Service is not ready');
    }
});

