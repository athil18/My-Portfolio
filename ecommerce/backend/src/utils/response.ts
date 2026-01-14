import { Response } from 'express';

interface ApiResponse {
    success: boolean;
    message: string;
    data?: unknown;
    error?: unknown;
}

export const sendResponse = (
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    data?: unknown,
    error?: unknown
) => {
    const response: ApiResponse = {
        success,
        message,
        data,
        error,
    };

    res.status(statusCode).json(response);
};
