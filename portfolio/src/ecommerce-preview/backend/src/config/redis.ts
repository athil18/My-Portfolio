import Redis from 'ioredis';
import env from './env';

const redisConfig = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    connectTimeout: 5000,
    retryStrategy: (times: number) => {
        if (times > 3) {
            console.warn('Redis connection failed after 3 attempts, running without Redis');
            return null; // Stop retrying
        }
        return Math.min(times * 500, 2000);
    },
};

export const redisConnection = new Redis(env.REDIS_URL, redisConfig);

redisConnection.on('error', (error) => {
    console.error('Redis connection error:', error);
});

redisConnection.on('connect', () => {
    console.log('Successfully connected to Redis');
});

export default redisConnection;
