import api from './api';

const authService = {
    register: async (userData: any) => {
        const response = await api.post('/auth/register', userData);
        // No localStorage.setItem here
        return response.data;
    },
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        // No localStorage.setItem here
        return response.data;
    },
    logout: async () => {
        await api.post('/auth/logout');
        // No localStorage.removeItem here
    },
    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        // No localStorage.setItem here
        return response.data;
    }
};

export default authService;
