import { Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service';

/**
 * Log a custom event
 */
export const logEvent = async (req: Request, res: Response) => {
    try {
        const { event, category, label, value, properties, url, guestId } = req.body;
        const userId = (req as any).user?.id;

        await analyticsService.trackEvent({
            userId,
            guestId,
            event,
            category,
            label,
            value,
            properties,
            url,
            userAgent: req.headers['user-agent'] || 'unknown',
            ip: req.ip,
            timestamp: new Date(),
        });

        res.status(204).send();
    } catch (error: any) {
        console.error('Analytics tracking error:', error);
        res.status(204).send();
    }
};

/**
 * Get stats (admin)
 */
export const getStats = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        const stats = await analyticsService.getEventStats(category as string);

        res.json({
            success: true,
            data: stats,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch stats',
        });
    }
};
