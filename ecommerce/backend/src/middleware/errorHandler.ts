import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import env from '../config/env';

export const globalErrorHandler = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal server error';
    let details: unknown = undefined;

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        if ('details' in err) {
            details = (err as { details?: unknown }).details;
        }
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    if ((err as any).code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value';
    }

    console.error(`[ERROR] ${statusCode} - ${message}`, err.stack);

    const response: Record<string, unknown> = {
        success: false,
        message,
        error: {
            statusCode,
            ...(details ? { details } : {}),
            ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
        },
    };

    res.status(statusCode).json(response);
};
