import api from './api';

const getFavorites = async () => {
    const response = await api.get('/favorites');
    return response.data;
};

const toggleFavoriteSong = async (songId: string) => {
    const response = await api.post('/favorites/song', { songId });
    return response.data;
};

const toggleFavoriteAlbum = async (albumId: string) => {
    const response = await api.post('/favorites/album', { albumId });
    return response.data;
};

const toggleFavoritePlaylist = async (playlistId: string) => {
    const response = await api.post('/favorites/playlist', { playlistId });
    return response.data;
};

const followArtist = async (artistId: string) => {
    const response = await api.post('/favorites/artist', { artistId });
    return response.data;
};

// Playlists
const getMyPlaylists = async () => {
    const response = await api.get('/playlists/me');
    return response.data;
};

const createPlaylist = async (data: { title: string; description?: string; isPublic?: boolean }) => {
    const response = await api.post('/playlists', data);
    return response.data;
};

const addSongToPlaylist = async (playlistId: string, songId: string) => {
    const response = await api.post('/playlists/add-song', { playlistId, songId });
    return response.data;
};

const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    const response = await api.post('/playlists/remove-song', { playlistId, songId });
    return response.data;
};

const userService = {
    getFavorites,
    toggleFavoriteSong,
    toggleFavoriteAlbum,
    toggleFavoritePlaylist,
    followArtist,
    getMyPlaylists,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
};

export default userService;
