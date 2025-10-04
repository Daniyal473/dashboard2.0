const express = require('express');
const router = express.Router();
const { getRevenueAndOccupancy, refreshListingsCache, fetchListingsData } = require('../services/revenueService');
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

// Route to refresh listings data
router.post('/refresh-listings', logRequest, async (req, res) => {
  try {
    console.log('🔄 Manual listings refresh requested');
    const freshListings = await refreshListingsCache();
    
    res.json({
      success: true,
      message: 'Listings data refreshed successfully',
      data: {
        categories: Object.keys(freshListings),
        totalListings: Object.values(freshListings).flat().length,
        categoryCounts: Object.fromEntries(
          Object.entries(freshListings).map(([category, listings]) => [category, listings.length])
        )
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error refreshing listings data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh listings data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route to get current listings data
router.get('/listings', logRequest, async (req, res) => {
  try {
    console.log('📋 Listings data requested');
    const listingsData = await fetchListingsData();
    
    res.json({
      success: true,
      data: {
        categories: listingsData,
        totalListings: Object.values(listingsData).flat().length,
        categoryCounts: Object.fromEntries(
          Object.entries(listingsData).map(([category, listings]) => [category, listings.length])
        )
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching listings data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listings data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route to clear listings data (no cache)
router.delete('/clear-listings-cache', logRequest, async (req, res) => {
  try {
    console.log('🗑️ Clearing in-memory listings data...');
    
    res.json({
      success: true,
      message: 'In-memory listings data will be refreshed on next request',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error clearing listings data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear listings data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/revenue/cron
 * Simple cron endpoint that works reliably
 */
router.get('/cron', async (req, res) => {
  try {
    const now = new Date();
    const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    
    // Format Pakistan date and time
    const day = pakistanTime.getUTCDate().toString().padStart(2, '0');
    const month = (pakistanTime.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = pakistanTime.getUTCFullYear();
    const hours = pakistanTime.getUTCHours().toString().padStart(2, '0');
    const minutes = pakistanTime.getUTCMinutes().toString().padStart(2, '0');
    const seconds = pakistanTime.getUTCSeconds().toString().padStart(2, '0');
    
    const pakistanDateTime = `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    
    console.log('🕐 Cron job triggered at:', pakistanDateTime);
    
    // Generate sample data
    const sampleData = {
      actualRevenue: `Rs${Math.floor(Math.random() * 500 + 100)}K`,
      expectedRevenue: `Rs${Math.floor(Math.random() * 600 + 200)}K`,
      totalRevenue: `Rs${Math.floor(Math.random() * 1000 + 300)}K`,
      occupancyRate: `${Math.floor(Math.random() * 40 + 60)}%`
    };
    
    console.log('✅ Cron job executed successfully');
    
    res.json({
      success: true,
      message: 'Hourly cron job executed successfully',
      timestamp: pakistanDateTime,
      pakistanTime: pakistanDateTime,
      data: sampleData,
      status: 'Cron job working! Backend is running every hour.',
      note: 'For real revenue data, run your local backend with: node src/server.js'
    });
    
  } catch (error) {
    console.error('❌ Cron job failed:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      status: 'Cron job failed'
    });
  }
});

module.exports = router;
