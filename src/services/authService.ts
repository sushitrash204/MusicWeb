import api from './api';

const authService = {
    register: async (userData: any) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
        }
        return response.data;
    },
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
        }
        return response.data;
    },
    logout: async () => {
        await api.post('/auth/logout');
        localStorage.removeItem('accessToken');
    },
    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
        }
        return response.data;
    }
};

export default authService;
