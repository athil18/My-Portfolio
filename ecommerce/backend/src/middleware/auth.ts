import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/auth.service';
import User from '../models/user.model';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

export const requireAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        let token = req.cookies?.accessToken;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            // Bypass for development mode if no token is provided
            if (process.env.NODE_ENV === 'development') {
                req.user = {
                    id: '507f1f77bcf86cd799439011', // Matches seeded test user
                    email: 'testuser@demo.com',
                    name: 'Demo User',
                    role: 'admin',
                };
                return next();
            }
            return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'No token provided');
        }

        const payload = verifyAccessToken(token);

        if (!payload) {
            return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Invalid or expired token');
        }

        let user;
        try {
            user = await User.findById(payload.userId);
        } catch (err) {
            // Check if error is CastError (invalid ObjectId format)
            if ((err as any).name === 'CastError') {
                return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Invalid user ID in token');
            }
            throw err;
        }

        if (!user || !user.isActive) {
            return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'User not found or inactive');
        }

        req.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        };

        next();
    } catch (error) {
        return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Authentication failed');
    }
};

export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
        }

        if (!roles.includes(req.user.role)) {
            return sendResponse(res, httpStatus.FORBIDDEN, false, 'Insufficient permissions');
        }

        next();
    };
};
