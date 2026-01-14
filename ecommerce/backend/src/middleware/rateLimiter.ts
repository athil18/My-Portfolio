import rateLimit from 'express-rate-limit';
import { AuthRequest } from './auth';

/**
 * Enhanced key generator for both IP and User identity
 */
const keyGenerator = (req: AuthRequest) => {
    return req.user ? `user:${req.user.id}` : req.ip || 'unknown';
};

/**
 * Rate limiter for authentication routes (login, signup, password reset)
 * Strict limits to prevent brute force attacks
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Relaxed for development - set to 10 in production
    keyGenerator: (req) => req.ip || 'unknown', // Always IP-based for auth
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: false, // Disable IPv6 validation warning
});

/**
 * General API rate limiter for all active routes
 * Uses IP + UserID for fair resource allocation
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Very relaxed for development - set to 500 in production
    keyGenerator: (req) => keyGenerator(req as AuthRequest),
    message: {
        success: false,
        message: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
});

/**
 * Strict limiter for sensitive resource creation (POST /products, etc)
 */
export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 actions per hour
    keyGenerator: (req) => keyGenerator(req as AuthRequest),
    message: {
        success: false,
        message: 'Too many attempts, please try again in an hour',
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
});
