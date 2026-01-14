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

// Compression middleware (before other middleware)
app.use(compression());

// Bull Board dashboard (protected - must be before other middleware)
import { setupQueuesDash } from './config/bullBoard';
setupQueuesDash(app);

// Enhanced health check endpoint (before rate limiting)
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

// Body parser (skip for Stripe webhooks which need raw body)
app.use((req, res, next) => {
    if (req.originalUrl === '/api/v1/orders/webhook') {
        next();
    } else {
        express.json({ limit: '10kb' })(req, res, next);
    }
});

// Sanitize data against NoSQL Injection
app.use(mongoSanitize({
    onSanitize: ({ req, key }) => {
        logger.warn(`[SECURITY] Forbidden NoSQL chars stripped from ${key}`, {
            ip: req.ip,
            path: req.path
        });
    },
}));

app.use(cookieParser());

// CORS with dynamic origin for development (allows multiple ports)
const allowedOrigins = [
    env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else if (env.NODE_ENV === 'development') {
            // In development, allow any localhost or 127.0.0.1 origin
            if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
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

// Helmet with stricter CSP for production
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

// Apply general rate limiter to all API routes
app.use('/api/v1', generalLimiter);

// Serve uploaded files with caching
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    maxAge: '1d',
    etag: true,
}));

// Routes
app.use('/api/v1', routes);

// Self-healing middleware (detects service degradation)
import { selfHealingMiddleware } from './middleware/selfHealing';
app.use(selfHealingMiddleware);

// Global error handler (must be last)
app.use(globalErrorHandler);

// Log app initialization
logger.info('Express app initialized', {
    env: env.NODE_ENV,
    corsOrigin: env.FRONTEND_URL
});

export default app;

// Export limiters for use in specific routes
export { authLimiter, strictLimiter };
