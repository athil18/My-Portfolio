import AnalyticsEvent, { IAnalyticsEvent } from '../models/analyticsEvent.model';

/**
 * Track an analytics event
 */
export const trackEvent = async (data: Partial<IAnalyticsEvent>): Promise<IAnalyticsEvent> => {
    return await AnalyticsEvent.create(data);
};

/**
 * Get aggregated analytics for dashboard (examples)
 */
export const getEventStats = async (category?: string) => {
    const query: any = {};
    if (category) query.category = category;

    return await AnalyticsEvent.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$event',
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
    ]);
};

/**
 * Get recent events
 */
export const getRecentEvents = async (limit: number = 20) => {
    return await AnalyticsEvent.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('userId', 'name email');
};
