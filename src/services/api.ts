import axios from 'axios';
import tokenManager from './tokenManager';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Attach Language & Token
api.interceptors.request.use(
    (config) => {
        // 1. Language
        if (typeof window !== 'undefined') {
            const lang = localStorage.getItem('language') || 'en';
            config.params = { ...config.params, lang };

            // USE RAM TOKEN instead of localStorage
            const token = tokenManager.getToken();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expired
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 and request hasn't been retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call refresh token endpoint (this uses HttpOnly cookie)
                const refreshUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/refresh`;
                const response = await axios.post(refreshUrl, {}, { withCredentials: true });

                const { accessToken } = response.data;

                if (accessToken) {
                    // STORE NEW TOKEN IN RAM
                    tokenManager.setToken(accessToken);

                    // Update header for original request
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                    // Retry original request
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed (token expired or invalid)
                tokenManager.setToken(null);

                // If it's a 429 from refresh, maybe don't redirect yet? 
                // But generally if refresh fails, we need to login again.
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    // Optional: clear user from localStorage here if we still use it for session signal
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
