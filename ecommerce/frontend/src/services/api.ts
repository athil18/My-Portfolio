import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});


apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 429 && !originalRequest._retryCount) {
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
            if (originalRequest._retryCount <= 3) {
                const retryAfter = parseInt(error.response.headers['retry-after'] || '2', 10);
                const delay = Math.min(retryAfter * 1000 * originalRequest._retryCount, 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
                return apiClient(originalRequest);
            }
        }

        if (error.response) {
            const message = error.response.data?.message || 'Something went wrong';

            if (error.response.status !== 401 && error.response.status !== 429 && !originalRequest._suppressError) {
                toast.error(message);
            }
        } else if (error.request) {
            toast.error('Network error. Please check your connection.');
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
                return apiClient(originalRequest);
            } catch {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
