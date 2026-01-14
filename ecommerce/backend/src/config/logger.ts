import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import env from './env';

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} ${level}: ${message} ${metaStr}`;
    })
);

// Create transports
const transports: winston.transport[] = [];

// Console transport
transports.push(
    new winston.transports.Console({
        format: env.NODE_ENV === 'development' ? consoleFormat : logFormat,
        level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    })
);

// File transports for production
if (env.NODE_ENV !== 'test') {
    // Combined logs
    transports.push(
        new DailyRotateFile({
            filename: path.join('logs', 'app-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            format: logFormat,
        })
    );

    // Error logs
    transports.push(
        new DailyRotateFile({
            filename: path.join('logs', 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d',
            level: 'error',
            format: logFormat,
        })
    );
}

// Create logger instance
const logger = winston.createLogger({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: logFormat,
    transports,
    exitOnError: false,
});

// Stream for Morgan integration (if needed)
export const loggerStream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};

/**
 * Sanitize sensitive data from logs
 */
export const sanitize = (obj: Record<string, any>): Record<string, any> => {
    const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie'];
    const sanitized = { ...obj };

    for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitize(sanitized[key]);
        }
    }

    return sanitized;
};

export default logger;
