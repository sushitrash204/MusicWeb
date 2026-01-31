import api from './api';

export interface Favorite {
    _id: string;
    user: string;
    songs: any[];
    albums: any[];
    playlists: any[];
    artists: any[];
    createdAt: string;
    updatedAt: string;
}

const favoriteService = {
    getFavorites: async (): Promise<Favorite> => {
        const response = await api.get('/favorites');
        return response.data;
    },

    toggleFavoriteSong: async (songId: string): Promise<Favorite> => {
        const response = await api.post('/favorites/song', { songId });
        return response.data;
    },

    toggleFavoriteAlbum: async (albumId: string): Promise<Favorite> => {
        const response = await api.post('/favorites/album', { albumId });
        return response.data;
    },

    toggleFavoritePlaylist: async (playlistId: string): Promise<Favorite> => {
        const response = await api.post('/favorites/playlist', { playlistId });
        return response.data;
    },

    followArtist: async (artistId: string): Promise<Favorite> => {
        const response = await api.post('/favorites/artist', { artistId });
        return response.data;
    }
};

export default favoriteService;
