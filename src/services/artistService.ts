import api from './api';

const getGenres = async () => {
    const response = await api.get('/genres');
    return response.data;
};

const submitArtistRequest = async (artistData: { artistName: string; bio: string }) => {
    const response = await api.post('/artists/request', artistData);
    return response.data;
};

const getMyArtistProfile = async () => {
    const response = await api.get('/artists/me');
    return response.data;
};

const artistService = {
    getGenres,
    submitArtistRequest,
    getMyArtistProfile
};

export default artistService;
