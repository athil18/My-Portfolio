import apiClient from './api';

export const securityService = {
    setup2FA: async () => {
        const response = await apiClient.post('/security/2fa/setup');
        return response.data;
    },

    verifySetup2FA: async (token: string) => {
        const response = await apiClient.post('/security/2fa/verify-setup', { token });
        return response.data;
    },

    verify2FALogin: async (userId: string, token: string) => {
        const response = await apiClient.post('/security/2fa/verify-login', { userId, token });
        return response.data;
    },

    disable2FA: async (token: string) => {
        const response = await apiClient.post('/security/2fa/disable', { token });
        return response.data;
    },

    getSessions: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await apiClient.get('/security/sessions', {
            headers: { 'x-refresh-token': refreshToken || '' },
        });
        return response.data;
    },

    deleteSession: async (sessionId: string) => {
        const response = await apiClient.delete(`/security/sessions/${sessionId}`);
        return response.data;
    },

    deleteAllSessions: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await apiClient.delete('/security/sessions', {
            data: { refreshToken },
        });
        return response.data;
    },
};
