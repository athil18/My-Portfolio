import Queue from 'bull';
import env from '../config/env';

let redisAvailable = true;
let lastLoggedError = 0;

/**
 * Base Queue configuration with Redis fallback
 */
export const createQueue = (name: string) => {
    const queue = new Queue(name, env.REDIS_URL, {
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        },
    });

    queue.on('error', (error) => {
        redisAvailable = false;
        const now = Date.now();
        if (now - lastLoggedError > 60000) {
            console.warn(`🛡️ [SELF-HEALING] Redis unavailable → Fallback: In-Memory Queue Mode`);
            lastLoggedError = now;
        }
    });

    queue.on('ready', () => {
        redisAvailable = true;
        console.log(`✅ [QUEUE] ${name} connected to Redis`);
    });

    return queue;
};

/**
 * Check if Redis is currently available
 */
export const isRedisAvailable = () => redisAvailable;
