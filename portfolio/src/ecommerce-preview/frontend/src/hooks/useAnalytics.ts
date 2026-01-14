import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Initialize GA4 if ID is provided
if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
}

export const useAnalytics = () => {
    const { user } = useAuth();
    const location = useLocation();

    /**
     * Track custom event (Internal + GA4)
     */
    const trackEvent = async (
        event: string,
        category: string,
        label?: string,
        value?: number,
        properties: Record<string, any> = {}
    ) => {
        // 1. GA4 Tracking
        if (GA_MEASUREMENT_ID) {
            ReactGA.event({
                category,
                action: event,
                label,
                value,
                ...properties,
            });
        }

        // 2. Internal Tracking
        try {
            await apiClient.post('/analytics/event', {
                event,
                category,
                label,
                value,
                properties,
                url: window.location.href,
                guestId: localStorage.getItem('guestId') || undefined,
            });
        } catch (error) {
            // Silently fail internal analytics
            console.warn('Internal analytics log failed', error);
        }
    };

    /**
     * Track Page View
     */
    const trackPageView = (path?: string) => {
        const page = path || location.pathname + location.search;

        if (GA_MEASUREMENT_ID) {
            ReactGA.send({ hitType: 'pageview', page });
        }

        // Internal page view log
        trackEvent('page_view', 'engagement', page);
    };

    // Auto-track page views on location change
    useEffect(() => {
        trackPageView();
    }, [location]);

    // Set user ID in GA4 if logged in
    useEffect(() => {
        if (user && GA_MEASUREMENT_ID) {
            ReactGA.set({ userId: user.id });
        }
    }, [user]);

    return { trackEvent, trackPageView };
};
