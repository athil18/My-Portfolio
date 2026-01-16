import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { emailQueue } from '../queues/email.queue';
import { imageQueue } from '../queues/image.queue';
import { Request, Response, NextFunction, Application } from 'express';
import { verifyAccessToken } from '../services/auth.service';
import User from '../models/user.model';

/**
 * Basic Auth middleware for Bull Board (fallback for local development)
 */
const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board"');
        return res.status(401).send('Authentication required');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    const validUsername = process.env.BULL_BOARD_USER || 'admin';
    const validPassword = process.env.BULL_BOARD_PASSWORD || 'admin123';

    if (username === validUsername && password === validPassword) {
        return next();
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board"');
    return res.status(401).send('Invalid credentials');
};

/**
 * JWT Admin Auth middleware for Bull Board (production)
 */
const jwtAdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = req.cookies?.accessToken;
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            return basicAuthMiddleware(req, res, next);
        }

        const payload = verifyAccessToken(token);
        if (!payload) {
            return basicAuthMiddleware(req, res, next);
        }

        const user = await User.findById(payload.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required for Bull Board'
            });
        }

        next();
    } catch (error) {
        return basicAuthMiddleware(req, res, next);
    }
};

/**
 * Setup Bull Board monitoring dashboard with authentication
 */
export const setupQueuesDash = (app: Application) => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
        queues: [
            new BullAdapter(emailQueue),
            new BullAdapter(imageQueue),
        ],
        serverAdapter: serverAdapter,
    });

    app.use('/admin/queues', jwtAdminMiddleware, serverAdapter.getRouter());
    console.log('Bull Board dashboard available at /admin/queues (protected)');
};
