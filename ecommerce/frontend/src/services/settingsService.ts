import apiClient from './api';

export const settingsService = {
    changePassword: async (currentPassword: string, newPassword: string) => {
        const response = await apiClient.patch('/settings/password', { currentPassword, newPassword });
        return response.data;
    },

    updateNotifications: async (settings: any) => {
        const response = await apiClient.patch('/settings/notifications', settings);
        return response.data;
    },

    getSessions: async () => {
        const response = await apiClient.get('/settings/sessions');
        return response.data;
    },

    exportData: async () => {
        const response = await apiClient.post('/settings/export-data');
        return response.data;
    },

    deleteAccount: async (password: string) => {
        const response = await apiClient.delete('/settings/account', { data: { password } });
        return response.data;
    },

    resendVerification: async (email: string) => {
        const response = await apiClient.post('/settings/resend-verification', { email });
        return response.data;
    },
};
