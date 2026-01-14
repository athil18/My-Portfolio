import apiClient from './api';

export const adminService = {
    getAllUsers: async (page: number = 1, limit: number = 10) => {
        const response = await apiClient.get(`/admin/users?page=${page}&limit=${limit}`);
        return response.data;
    },

    changeUserRole: async (userId: string, role: 'user' | 'admin') => {
        const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
        return response.data;
    },

    deleteUser: async (userId: string) => {
        const response = await apiClient.delete(`/admin/users/${userId}`);
        return response.data;
    },
};
