import express from 'express';
import axios from 'axios';

const router = express.Router();
const RAWG_API_KEY = process.env.RAWG_API_KEY || '08486d426a474635b2e6aa131e9566f5';

// Proxy games search requests
router.get('/games', async (req, res) => {
  try {
    const rawgUrl = 'https://api.rawg.io/api/games';
    console.log(`Proxying RAWG API request: ${rawgUrl}`);
    
    const response = await axios.get(rawgUrl, {
      params: {
        ...req.query,
        key: RAWG_API_KEY
      },
      timeout: 10000 // 10 second timeout
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('RAWG API Error:', error.message);
    
    if (error.response) {
      // API responded with error status
      res.status(error.response.status).json({
        error: 'RAWG API error',
        message: error.response.data?.detail || error.message,
        status: error.response.status
      });
    } else if (error.request) {
      // Network error
      res.status(503).json({
        error: 'Network error',
        message: 'Unable to reach RAWG API'
      });
    } else {
      // Other error
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Proxy game details requests
router.get('/games/:id', async (req, res) => {
  try {
    const rawgUrl = `https://api.rawg.io/api/games/${req.params.id}`;
    console.log(`Proxying RAWG API request: ${rawgUrl}`);
    
    const response = await axios.get(rawgUrl, {
      params: {
        ...req.query,
        key: RAWG_API_KEY
      },
      timeout: 10000 // 10 second timeout
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('RAWG API Error:', error.message);
    
    if (error.response) {
      // API responded with error status
      res.status(error.response.status).json({
        error: 'RAWG API error',
        message: error.response.data?.detail || error.message,
        status: error.response.status
      });
    } else if (error.request) {
      // Network error
      res.status(503).json({
        error: 'Network error',
        message: 'Unable to reach RAWG API'
      });
    } else {
      // Other error
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Proxy genres requests
router.get('/genres', async (req, res) => {
  try {
    const rawgUrl = 'https://api.rawg.io/api/genres';
    console.log(`Proxying RAWG API request: ${rawgUrl}`);
    
    const response = await axios.get(rawgUrl, {
      params: {
        ...req.query,
        key: RAWG_API_KEY
      },
      timeout: 10000 // 10 second timeout
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('RAWG API Error:', error.message);
    
    if (error.response) {
      // API responded with error status
      res.status(error.response.status).json({
        error: 'RAWG API error',
        message: error.response.data?.detail || error.message,
        status: error.response.status
      });
    } else if (error.request) {
      // Network error
      res.status(503).json({
        error: 'Network error',
        message: 'Unable to reach RAWG API'
      });
    } else {
      // Other error
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Proxy platforms requests
router.get('/platforms', async (req, res) => {
  try {
    const rawgUrl = 'https://api.rawg.io/api/platforms';
    console.log(`Proxying RAWG API request: ${rawgUrl}`);
    
    const response = await axios.get(rawgUrl, {
      params: {
        ...req.query,
        key: RAWG_API_KEY
      },
      timeout: 10000 // 10 second timeout
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('RAWG API Error:', error.message);
    
    if (error.response) {
      // API responded with error status
      res.status(error.response.status).json({
        error: 'RAWG API error',
        message: error.response.data?.detail || error.message,
        status: error.response.status
      });
    } else if (error.request) {
      // Network error
      res.status(503).json({
        error: 'Network error',
        message: 'Unable to reach RAWG API'
      });
    } else {
      // Other error
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

export default router;