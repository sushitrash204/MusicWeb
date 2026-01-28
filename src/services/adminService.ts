import api from './api';

const getAllPendingRequests = async () => {
    const response = await api.get('/artists/requests/pending');
    return response.data;
};

const approveArtistRequest = async (id: string) => {
    const response = await api.put(`/artists/request/${id}/approve`);
    return response.data;
};

const rejectArtistRequest = async (id: string) => {
    const response = await api.put(`/artists/request/${id}/reject`);
    return response.data;
};

const createGenre = async (name: string, description: string) => {
    const response = await api.post('/genres', { name, description });
    return response.data;
};

const adminService = {
    getAllPendingRequests,
    approveArtistRequest,
    rejectArtistRequest,
    createGenre
};

export default adminService;
