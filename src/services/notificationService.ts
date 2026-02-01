import api from './api';

const notificationService = {
    getMyNotifications: async (params: { limit?: number; offset?: number } = {}) => {
        const { limit = 20, offset = 0 } = params;
        const response = await api.get(`/notifications?limit=${limit}&offset=${offset}`);
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },

    markAsRead: async (id: string) => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.put('/notifications/read-all');
        return response.data;
    },

    deleteReadNotifications: async () => {
        const response = await api.delete('/notifications/read');
        return response.data;
    }
};

export default notificationService;
