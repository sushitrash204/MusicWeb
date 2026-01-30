import api from './api';

/**
 * Lấy danh sách tất cả albums
 */
export const getAllAlbums = async (page: number = 1, limit: number = 20, sort: string = 'releaseDate') => {
    const response = await api.get(`/albums?page=${page}&limit=${limit}&sort=${sort}`);
    return response.data;
};

/**
 * Lấy chi tiết album theo ID
 */
export const getAlbumById = async (albumId: string) => {
    const response = await api.get(`/albums/${albumId}`);
    return response.data;
};

/**
 * Lấy albums của một nghệ sĩ
 */
export const getAlbumsByArtist = async (artistId: string) => {
    const response = await api.get(`/albums/artist/${artistId}`);
    return response.data;
};

/**
 * Lấy albums của nghệ sĩ hiện tại (cần authentication)
 */
export const getMyAlbums = async () => {
    const response = await api.get('/albums/my/albums');
    return response.data;
};

/**
 * Tạo album mới (chỉ nghệ sĩ)
 */
export const createAlbum = async (data: any) => {
    // Check if data is FormData to set correct headers
    const config = data instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};

    const response = await api.post('/albums', data, config);
    return response.data;
};

/**
 * Cập nhật album
 */
export const updateAlbum = async (albumId: string, data: {
    title?: string;
    description?: string;
    coverImage?: string;
    releaseDate?: Date;
}) => {
    const response = await api.put(`/albums/${albumId}`, data);
    return response.data;
};

/**
 * Xóa album
 */
export const deleteAlbum = async (albumId: string) => {
    const response = await api.delete(`/albums/${albumId}`);
    return response.data;
};

/**
 * Thêm bài hát vào album
 */
export const addSongToAlbum = async (albumId: string, songId: string) => {
    const response = await api.post('/albums/add-song', { albumId, songId });
    return response.data;
};

/**
 * Xóa bài hát khỏi album
 */
export const removeSongFromAlbum = async (albumId: string, songId: string) => {
    const response = await api.post('/albums/remove-song', { albumId, songId });
    return response.data;
};

const albumService = {
    getAllAlbums,
    getAlbumById,
    getAlbumsByArtist,
    getMyAlbums,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    addSongToAlbum,
    removeSongFromAlbum
};

export default albumService;
