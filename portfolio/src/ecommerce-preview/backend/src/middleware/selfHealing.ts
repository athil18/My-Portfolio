import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import logger from '../config/logger';

/**
 * AI-Driven Self-Healing Middleware
 * Detects common service failures and provides actionable recovery steps in logs.
 */
export const selfHealingMiddleware = (err: Error, _req: Request, _res: Response, next: NextFunction) => {
    const errorMsg = err.message || '';
    const _stack = err.stack || '';

    // 1. Detect MongoDB SSL/Whitelist Issues
    if (errorMsg.includes('SSL alert number 80') || errorMsg.includes('ECONNREFUSED 127.0.0.1:27017')) {
        logger.error('🛡️ [SELF-HEALING] MongoDB Connection Failure Detected.');
        logger.info('👉 DIAGNOSIS: Your IP address likely changed or is not whitelisted in Atlas.');
        logger.info(`👉 RECOVERY: Log in to Atlas and whitelist your current IP.`);
    }

    // 2. Detect Redis Failures
    if (errorMsg.includes('Redis connection to 127.0.0.1:6379 failed')) {
        logger.warn('🛡️ [SELF-HEALING] Redis Service Offline.');
        logger.info('👉 DIAGNOSIS: Background workers (Email/Image) are blocked.');
        logger.info('👉 RECOVERY: Start Redis server or update REDIS_URL in .env.');
    }

    // 3. Detect JWT/Auth Secret Issues
    if (errorMsg.includes('secret or public key must be provided')) {
        logger.error('🛡️ [SELF-HEALING] Authentication Configuration Error.');
        logger.info('👉 DIAGNOSIS: JWT_SECRET is missing from environment variables.');
        logger.info('👉 RECOVERY: Add JWT_SECRET to your .env file and restart backend.');
    }

    // 4. Detect Stripe Configuration Issues
    if (errorMsg.includes('No API key provided')) {
        logger.error('🛡️ [SELF-HEALING] Stripe Service Error.');
        logger.info('👉 DIAGNOSIS: STRIPE_SECRET_KEY is missing.');
        logger.info('👉 RECOVERY: Check your .env for Stripe keys.');
    }

    next(err);
};

/**
 * Utility to check service health and log repair paths proactively
 */
export const runProactiveRepair = async () => {
    const health: string[] = [];

    // DB Check
    if (mongoose.connection.readyState !== 1) {
        health.push('❌ Database: Disconnected. Check Atlas IP Whitelist.');
    } else {
        health.push('✅ Database: Connected.');
    }

    // Port occupation check (internal)
    logger.info('🛡️ [SELF-HEALING] Proactive Health Audit:', { health });
};
