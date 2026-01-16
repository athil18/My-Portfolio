import mongoose from 'mongoose';
import { redisConnection } from '../config/redis';
import env from '../config/env';

interface HealthStatus {
    status: 'ok' | 'degraded' | 'critical';
    timestamp: string;
    services: {
        database: { status: string; latency?: number };
        redis: { status: string };
        stripe: { status: string };
    };
    system: {
        uptime: number;
        memory: NodeJS.MemoryUsage;
        nodeVersion: string;
    };
}

export const getHealthStatus = async (): Promise<HealthStatus> => {
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const dbState = dbStates[mongoose.connection.readyState] || 'unknown';

    let redisStatus = 'disconnected';
    try {
        if (redisConnection.status === 'ready') {
            redisStatus = 'connected';
        } else if (redisConnection.status === 'connecting') {
            redisStatus = 'connecting';
        }
    } catch {
        redisStatus = 'error';
    }

    const stripeStatus = env.STRIPE_SECRET_KEY?.startsWith('sk_') ? 'configured' : 'missing';

    let overallStatus: 'ok' | 'degraded' | 'critical' = 'ok';
    if (dbState !== 'connected') {
        overallStatus = 'critical';
    } else if (redisStatus !== 'connected') {
        overallStatus = 'degraded';
    }

    return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        services: {
            database: { status: dbState },
            redis: { status: redisStatus },
            stripe: { status: stripeStatus },
        },
        system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
        },
    };
};

export const isReady = async (): Promise<boolean> => {
    const health = await getHealthStatus();
    return health.status !== 'critical';
};

