import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

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
        if (GA_MEASUREMENT_ID) {
            ReactGA.event({
                category,
                action: event,
                label,
                value,
                ...properties,
            });
        }

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

        trackEvent('page_view', 'engagement', page);
    };

    useEffect(() => {
        trackPageView();
    }, [location]);

    useEffect(() => {
        if (user && GA_MEASUREMENT_ID) {
            ReactGA.set({ userId: user.id });
        }
    }, [user]);

    return { trackEvent, trackPageView };
};
