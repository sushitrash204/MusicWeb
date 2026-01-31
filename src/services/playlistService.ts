import api from './api';

export interface Playlist {
    _id: string;
    title: string;
    description?: string;
    coverImage?: string;
    songs: any[];
    owner: any;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

const playlistService = {
    createPlaylist: async (data: { title: string, description?: string, isPublic?: boolean }) => {
        const response = await api.post('/playlists', data);
        return response.data;
    },

    getMyPlaylists: async (): Promise<Playlist[]> => {
        const response = await api.get('/playlists/me');
        return response.data;
    },

    getPlaylistById: async (id: string): Promise<Playlist> => {
        const response = await api.get(`/playlists/${id}`);
        return response.data;
    },

    updatePlaylist: async (id: string, data: Partial<Playlist>) => {
        const response = await api.put(`/playlists/${id}`, data);
        return response.data;
    },

    deletePlaylist: async (id: string) => {
        const response = await api.delete(`/playlists/${id}`);
        return response.data;
    },

    addSongToPlaylist: async (playlistId: string, songId: string) => {
        const response = await api.post('/playlists/add-song', { playlistId, songId });
        return response.data;
    },

    removeSongFromPlaylist: async (playlistId: string, songId: string) => {
        const response = await api.post('/playlists/remove-song', { playlistId, songId });
        return response.data;
    }
};

export default playlistService;
