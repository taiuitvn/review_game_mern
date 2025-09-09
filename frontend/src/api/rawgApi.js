// RAWG API integration for game search
import axios from 'axios';

const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY || '08486d426a474635b2e6aa131e9566f5';

// Use CORS proxy for production, Vite proxy for development
const baseURL = import.meta.env.PROD 
  ? 'https://api.allorigins.win/raw?url=https://api.rawg.io/api'
  : '/rawg-api';

const rawgApi = axios.create({
  baseURL,
  params: {
    key: RAWG_API_KEY
  }
});

// Add required headers for CORS proxy
if (import.meta.env.PROD) {
  rawgApi.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}

export const searchGames = async (query, page = 1, pageSize = 10) => {
  try {
    const response = await rawgApi.get('/games', {
      params: {
        search: query,
        page,
        page_size: pageSize,
        ordering: '-rating' // Order by rating descending
      }
    });
    
    console.log('RAWG API response for search:', query, response.data);
    return response;
  } catch (error) {
    console.error('Error searching games from RAWG:', error);
    throw error;
  }
};

// Get game details by ID
export const getGameById = async (gameId) => {
  try {
    const response = await rawgApi.get(`/games/${gameId}`);
    console.log('RAWG API response for game details:', gameId, response.data);
    return response;
  } catch (error) {
    console.error('Error fetching game details from RAWG:', error);
    throw error;
  }
};

// Get popular games
export const getPopularGames = async (page = 1, pageSize = 20) => {
  try {
    const response = await rawgApi.get('/games', {
      params: {
        page,
        page_size: pageSize,
        ordering: '-rating',
        metacritic: '80,100' // Only highly rated games
      }
    });
    
    console.log('RAWG API response for popular games:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching popular games from RAWG:', error);
    throw error;
  }
};

// Get games by genre
export const getGamesByGenre = async (genreId, page = 1, pageSize = 20) => {
  try {
    const response = await rawgApi.get('/games', {
      params: {
        genres: genreId,
        page,
        page_size: pageSize,
        ordering: '-rating'
      }
    });
    
    console.log('RAWG API response for games by genre:', genreId, response.data);
    return response;
  } catch (error) {
    console.error('Error fetching games by genre from RAWG:', error);
    throw error;
  }
};

// Get game genres
export const getGenres = async () => {
  try {
    const response = await rawgApi.get('/genres');
    console.log('RAWG API response for genres:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching genres from RAWG:', error);
    throw error;
  }
};

// Get game platforms
export const getPlatforms = async () => {
  try {
    const response = await rawgApi.get('/platforms');
    console.log('RAWG API response for platforms:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching platforms from RAWG:', error);
    throw error;
  }
};

// Get games by platform
export const getGamesByPlatform = async (platformId, page = 1, pageSize = 20) => {
  try {
    const response = await rawgApi.get('/games', {
      params: {
        platforms: platformId,
        page,
        page_size: pageSize,
        ordering: '-rating'
      }
    });
    
    console.log('RAWG API response for games by platform:', platformId, response.data);
    return response;
  } catch (error) {
    console.error('Error fetching games by platform from RAWG:', error);
    throw error;
  }
};

export default rawgApi;