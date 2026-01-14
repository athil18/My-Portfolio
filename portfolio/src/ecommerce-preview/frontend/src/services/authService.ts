import apiClient from './api';

export interface LoginData {
    email: string;
    password: string;
}

export interface SignupData {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
        accessToken: string;
        refreshToken: string;
    };
}

export interface ProfileData {
    name?: string;
    profile?: {
        phone?: string;
        location?: {
            city?: string;
            country?: string;
        };
        dateOfBirth?: string;
        bio?: string;
        socialLinks?: {
            twitter?: string;
            linkedin?: string;
            github?: string;
        };
    };
}

export const authService = {
    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    signup: async (data: SignupData): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/signup', data);
        return response.data;
    },

    verifyEmail: async (token: string): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/verify-email', { token });
        return response.data;
    },

    forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.post('/auth/reset-password', { token, newPassword });
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/users/me');
        return response.data;
    },

    updateProfile: async (data: ProfileData) => {
        const response = await apiClient.put('/users/me', data);
        return response.data;
    },

    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await apiClient.patch('/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
