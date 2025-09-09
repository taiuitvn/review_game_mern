// RAWG API integration for game search
import axios from 'axios';

// Use backend proxy for both development and production
const baseURL = import.meta.env.PROD 
  ? 'https://review-game-mern-be.vercel.app/api/rawg' 
  : 'http://localhost:8000/api/rawg';

const rawgApi = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for error handling and logging
rawgApi.interceptors.request.use(
  (config) => {
    console.log(`Making RAWG API request: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('RAWG API request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
rawgApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('RAWG API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.detail || error.message;
      
      if (status === 403) {
        throw new Error('RAWG API access forbidden. Please check API key or try again later.');
      } else if (status === 429) {
        throw new Error('Too many requests to RAWG API. Please try again later.');
      } else if (status >= 500) {
        throw new Error('RAWG API server error. Please try again later.');
      } else if (status === 503) {
        throw new Error('RAWG API service unavailable. Please try again later.');
      } else {
        throw new Error(`RAWG API error: ${message}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error: Unable to connect to RAWG API. Please check your internet connection.');
    } else {
      // Other error
      throw new Error(`Request error: ${error.message}`);
    }
  }
);

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