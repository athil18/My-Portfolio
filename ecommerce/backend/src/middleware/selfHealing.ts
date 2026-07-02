import { Request, Response, NextFunction } from 'express';
import { isDbConnected } from '../config/db';
import logger from '../config/logger';

/**
 * Self-Healing Middleware — Supabase PostgreSQL Migration
 * Detects common service failures and provides actionable recovery steps in logs.
 */
export const selfHealingMiddleware = (err: Error, _req: Request, _res: Response, next: NextFunction) => {
    const errorMsg = err.message || '';

    if (errorMsg.includes('ECONNREFUSED') && errorMsg.includes('5432')) {
        logger.error('🛡️ [SELF-HEALING] PostgreSQL Connection Failure Detected.');
        logger.info('👉 DIAGNOSIS: Database is unreachable. Check Supabase status or network.');
        logger.info('👉 RECOVERY: Verify DATABASE_URL in .env and Supabase project status.');
    }

    if (errorMsg.includes('Redis connection') || errorMsg.includes('ECONNREFUSED') && errorMsg.includes('6379')) {
        logger.warn('🛡️ [SELF-HEALING] Redis Service Offline.');
        logger.info('👉 DIAGNOSIS: Background workers (Email/Image) are blocked.');
        logger.info('👉 RECOVERY: Start Redis server or update REDIS_URL in .env.');
    }

    if (errorMsg.includes('secret or public key must be provided') || errorMsg.includes('JWT')) {
        logger.error('🛡️ [SELF-HEALING] Authentication Configuration Error.');
        logger.info('👉 DIAGNOSIS: Supabase keys may be missing from environment variables.');
        logger.info('👉 RECOVERY: Check SUPABASE_SECRET_KEY in your .env file and restart.');
    }

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

    if (!isDbConnected()) {
        health.push('❌ Database: Disconnected. Check Supabase/PostgreSQL connection.');
    } else {
        health.push('✅ Database: Connected.');
    }

    logger.info('🛡️ [SELF-HEALING] Proactive Health Audit:', { health });
};
