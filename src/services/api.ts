import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Backend matches .env PORT=3000
    withCredentials: true, // Important for cookies (refreshToken)
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Attach Language & Token
api.interceptors.request.use(
    (config) => {
        // 1. Language
        if (typeof window !== 'undefined') {
            const lang = localStorage.getItem('language') || 'vi';
            config.params = { ...config.params, lang };

            // 2. Access Token (if stored in localStorage/memory)
            // For this implementation, we might be using cookies for refresh token, 
            // but usually access token is in memory or local storage.
            // Let's assume we store accessToken in localStorage for simplicity, or just rely on cookies if we did cookie-only.
            // The backend authMiddleware checks 'Authorization: Bearer ...'.
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expired (Optional, for advanced refresh flow)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle global errors or token refresh logic here if needed
        return Promise.reject(error);
    }
);

export default api;
