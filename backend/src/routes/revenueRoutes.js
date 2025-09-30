const express = require('express');
const router = express.Router();
const { getRevenueAndOccupancy } = require('../services/revenueService');
const config = require('../config/config');

// Middleware for API key authentication (optional)
const authenticateApiKey = (req, res, next) => {
  if (config.API_KEY) {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    if (!apiKey || apiKey !== config.API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or missing API key'
      });
    }
  }
  next();
};

// Middleware for request logging
const logRequest = (req, res, next) => {
  if (config.ENABLE_REQUEST_LOGGING) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  }
  next();
};

// Cache middleware
let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const cacheMiddleware = (req, res, next) => {
  const now = Date.now();
  
  // Check if we have cached data and it's still valid
  if (cachedData && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('Serving cached revenue data');
    return res.json({
      success: true,
      data: cachedData,
      cached: true,
      cacheAge: Math.floor((now - cacheTimestamp) / 1000) // age in seconds
    });
  }
  
  next();
};

/**
 * @route GET /api/revenue
 * @desc Get current revenue and occupancy data
 * @access Public (with optional API key)
 */
router.get('/', logRequest, authenticateApiKey, cacheMiddleware, async (req, res) => {
  try {
    console.log('Fetching fresh revenue and occupancy data...');
    const startTime = Date.now();
    
    const data = await getRevenueAndOccupancy();
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Update cache
    cachedData = data;
    cacheTimestamp = Date.now();
    
    console.log(`Revenue data fetched successfully in ${processingTime}ms`);
    
    res.json({
      success: true,
      data,
      cached: false,
      processingTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    
    // If we have cached data, return it with error flag
    if (cachedData) {
      return res.json({
        success: false,
        data: cachedData,
        cached: true,
        error: 'Fresh data unavailable, serving cached data',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue data',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/revenue/summary
 * @desc Get summarized revenue data (lighter response)
 * @access Public (with optional API key)
 */
router.get('/summary', logRequest, authenticateApiKey, async (req, res) => {
  try {
    const data = await getRevenueAndOccupancy();
    
    // Return only essential data
    const summary = {
      actualRevenue: data.actualRevenue,
      expectedRevenue: data.expectedRevenue,
      totalRevenue: data.totalRevenue,
      occupancyRate: data.occupancyRate,
      totalRooms: data.totalRooms,
      totalReserved: data.totalReserved,
      totalAvailable: data.totalAvailable
    };
    
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching revenue summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue summary',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/revenue/occupancy
 * @desc Get only occupancy data
 * @access Public (with optional API key)
 */
router.get('/occupancy', logRequest, authenticateApiKey, async (req, res) => {
  try {
    const data = await getRevenueAndOccupancy();
    
    const occupancyData = {
      occupancyRate: data.occupancyRate,
      categoryAvailability: data.categoryAvailability,
      totalRooms: data.totalRooms,
      totalReserved: data.totalReserved,
      totalAvailable: data.totalAvailable
    };
    
    res.json({
      success: true,
      data: occupancyData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching occupancy data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch occupancy data',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/revenue/refresh
 * @desc Force refresh of revenue data (clears cache)
 * @access Public (with optional API key)
 */
router.post('/refresh', logRequest, authenticateApiKey, async (req, res) => {
  try {
    // Clear cache
    cachedData = null;
    cacheTimestamp = null;
    
    console.log('Cache cleared, fetching fresh revenue data...');
    const startTime = Date.now();
    
    const data = await getRevenueAndOccupancy();
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    // Update cache with fresh data
    cachedData = data;
    cacheTimestamp = Date.now();
    
    res.json({
      success: true,
      data,
      refreshed: true,
      processingTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error refreshing revenue data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh revenue data',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/revenue/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'Revenue API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cache: {
      hasData: !!cachedData,
      age: cacheTimestamp ? Math.floor((Date.now() - cacheTimestamp) / 1000) : null
    }
  });
});

module.exports = router;
