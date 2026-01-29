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

const updateArtistProfile = async (artistData: { artistName?: string; bio?: string }) => {
    const response = await api.put('/artists/me', artistData);
    return response.data;
};

const getArtists = async () => {
    const response = await api.get('/artists');
    return response.data;
};

// Song Management
const createSong = async (songData: FormData) => {
    const response = await api.post('/songs', songData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const getMySongs = async () => {
    const response = await api.get('/songs/my-songs');
    return response.data;
};

const deleteSong = async (id: string) => {
    const response = await api.delete(`/songs/${id}`);
    return response.data;
};

const updateSong = async (id: string, songData: FormData) => {
    const response = await api.put(`/songs/${id}`, songData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const getSongById = async (id: string) => {
    const response = await api.get(`/songs/${id}`);
    return response.data;
};

const getRecentSongs = async (limit: number = 10) => {
    const response = await api.get(`/songs/recent?limit=${limit}`);
    return response.data;
};

const getArtistById = async (id: string) => {
    const response = await api.get(`/artists/${id}`);
    return response.data;
};

const getArtistSongs = async (artistId: string) => {
    const response = await api.get(`/songs/artist/${artistId}`);
    return response.data;
};

const artistService = {
    getGenres,
    submitArtistRequest,
    getMyArtistProfile,
    updateArtistProfile,
    getArtists,
    createSong,
    getMySongs,
    deleteSong,
    updateSong,
    getSongById,
    getRecentSongs,
    getArtistById,
    getArtistSongs
};

export default artistService;
