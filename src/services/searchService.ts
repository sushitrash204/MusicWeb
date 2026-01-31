import api from './api';

export interface SearchResults {
    songs: any[];
    albums: any[];
    artists: any[];
    playlists: any[];
}

const searchService = {
    search: async (query: string): Promise<SearchResults> => {
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        return response.data;
    }
};

export default searchService;
