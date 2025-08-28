import axios from 'axios';

const apiKey = import.meta.env.VITE_RAWG_API_KEY;

const rawgApi = axios.create({
  baseURL: 'https://api.rawg.io/api',
});

// Lấy game theo từ khóa (dùng cho thanh tìm kiếm nhỏ)
export const searchGames = (query) => {
  if (!query) return Promise.resolve({ data: { results: [] } });
  return rawgApi.get('/games', {
    params: { key: apiKey, search: query, page_size: 5 }
  });
};

// Lấy chi tiết một game từ RAWG
export const getGameDetailsById = (gameId) => {
    return rawgApi.get(`/games/${gameId}`, { params: { key: apiKey } });
};

// Lấy danh sách game theo thể loại, nền tảng, hoặc tìm kiếm (cho trang Discovery)
export const discoverGames = (params) => {
    return rawgApi.get('/games', {
        params: {
            key: apiKey,
            ...params, // genres, platforms, search
        }
    });
};