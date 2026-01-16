import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import mongoose from 'mongoose';
import routes from './routes/v1';
import { globalErrorHandler } from './middleware/errorHandler';
import { generalLimiter, authLimiter, strictLimiter } from './middleware/rateLimiter';
import env from './config/env';
import logger from './config/logger';

const app: Application = express();

app.use(compression());

import { setupQueuesDash } from './config/bullBoard';
setupQueuesDash(app);

app.get('/health', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const status = dbStatus === 'connected' ? 'ok' : 'degraded';

    res.json({
        status,
        timestamp: new Date().toISOString(),
        env: env.NODE_ENV,
        services: {
            database: dbStatus,
            server: 'running',
        }
    });
});

import mongoSanitize from 'express-mongo-sanitize';

app.use((req, res, next) => {
    if (req.originalUrl === '/api/v1/orders/webhook') {
        next();
    } else {
        express.json({ limit: '10kb' })(req, res, next);
    }
});

app.use(mongoSanitize({
    onSanitize: ({ req, key }) => {
        logger.warn(`[SECURITY] Forbidden NoSQL chars stripped from ${key}`, {
            ip: req.ip,
            path: req.path
        });
    },
}));

app.use(cookieParser());

const allowedOrigins = [
    env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else if (env.NODE_ENV === 'development') {
            if (origin.startsWith('http://localhost:')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "js.stripe.com"],
            frameSrc: ["'self'", "js.stripe.com"],
            connectSrc: ["'self'", "api.stripe.com"],
            imgSrc: ["'self'", "data:", "res.cloudinary.com", "*.stripe.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
        }
    } : false,
}));

app.use('/api/v1', generalLimiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    maxAge: '1d',
    etag: true,
}));

app.use('/api/v1', routes);

import { selfHealingMiddleware } from './middleware/selfHealing';
app.use(selfHealingMiddleware);

app.use(globalErrorHandler);

logger.info('Express app initialized', {
    env: env.NODE_ENV,
    corsOrigin: env.FRONTEND_URL
});

export default app;

export { authLimiter, strictLimiter };
