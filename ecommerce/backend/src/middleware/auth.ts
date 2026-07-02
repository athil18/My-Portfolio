import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
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

/**
 * AUTH MIDDLEWARE — Supabase PostgreSQL Migration
 *
 * Replaces the previous JWT verification middleware that used:
 *   - jsonwebtoken.verify() with a local JWT_SECRET
 *   - MongoDB User.findById() lookup
 *
 * Now uses:
 *   - supabaseAdmin.auth.getUser(token) to validate Supabase JWTs
 *   - PostgreSQL profiles table lookup for role/name metadata
 *
 * The AuthRequest shape is UNCHANGED to maintain API compatibility.
 */
export const requireAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // Extract token from cookie or Authorization header
        let token = req.cookies?.accessToken;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            if (process.env.NODE_ENV === 'development') {
                // Development bypass — preserved from original code
                req.user = {
                    id: '00000000-0000-0000-0000-000000000001',
                    email: 'testuser@demo.com',
                    name: 'Demo User',
                    role: 'admin',
                };
                return next();
            }
            return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'No token provided');
        }

        // Verify the Supabase JWT and get the user
        const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !authUser) {
            return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Invalid or expired token');
        }

        // Fetch the profile for role and name
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('name, role, is_active')
            .eq('id', authUser.id)
            .single();

        if (profileError || !profile) {
            return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'User profile not found');
        }

        if (!profile.is_active) {
            return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'User not found or inactive');
        }

        req.user = {
            id: authUser.id,
            email: authUser.email!,
            name: profile.name,
            role: profile.role,
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
