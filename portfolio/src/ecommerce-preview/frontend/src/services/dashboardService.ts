import apiClient from './api';

export const dashboardService = {
    getStats: async () => {
        const response = await apiClient.get('/dashboard/stats');
        return response.data;
    },

    getActivity: async () => {
        const response = await apiClient.get('/dashboard/activity');
        return response.data;
    },

    getSummary: async () => {
        const response = await apiClient.get('/dashboard/summary');
        return response.data;
    },
};
