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

// axios instances automatically handle cookies with withCredentials: true

// Handle token refresh on 401 and retry on 429
apiClient.interceptors.response.use(
    (response) => {
        // Option to suppress global toast if handled locally
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 429 Too Many Requests with exponential backoff
        if (error.response?.status === 429 && !originalRequest._retryCount) {
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
            if (originalRequest._retryCount <= 3) {
                const retryAfter = parseInt(error.response.headers['retry-after'] || '2', 10);
                const delay = Math.min(retryAfter * 1000 * originalRequest._retryCount, 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
                return apiClient(originalRequest);
            }
        }

        // Global error notification
        if (error.response) {
            const message = error.response.data?.message || 'Something went wrong';

            // Don't toast for auth errors (handled by redirect/refresh) or if intentionally suppressed
            if (error.response.status !== 401 && error.response.status !== 429 && !originalRequest._suppressError) {
                toast.error(message);
            }
        } else if (error.request) {
            toast.error('Network error. Please check your connection.');
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Refresh endpoint will now read/set HttpOnly cookies automatically
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
