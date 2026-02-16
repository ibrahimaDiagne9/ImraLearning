import axios from 'axios';
import { toast } from './toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle Network Errors (e.g., Server Down)
        if (!error.response) {
            console.error('[API Network Error]', error);
            const networkErrorMessage = 'Cannot connect to the server. Please check your internet connection or try again later.';
            toast.error(networkErrorMessage);
            return Promise.reject(new Error(networkErrorMessage));
        }

        // Handle 401 Unauthorized (Token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_URL}/token/refresh/`, {
                        refresh: refreshToken,
                    });
                    const { access } = response.data;
                    localStorage.setItem('access_token', access);
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    console.error('[API Refresh Error]', refreshError);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        // Global Error Handling
        const errorMessage = error.response?.data?.message ||
            error.response?.data?.detail ||
            error.message ||
            'An unexpected error occurred';

        console.error(`[API Error ${error.response?.status}]`, error.response?.data || error.message);

        // Don't show toast for 401 as it's handled above, 
        // and maybe silent for some specific endpoints if needed
        if (error.response?.status !== 401) {
            toast.error(errorMessage);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
