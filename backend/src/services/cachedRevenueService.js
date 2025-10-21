const cacheService = require('./cacheService');
const { getRevenueAndOccupancy } = require('./revenueService');

class CachedRevenueService {
  constructor() {
    // Cache keys
    this.REVENUE_CACHE_KEY = 'revenue_data';
    this.LISTINGS_CACHE_KEY = 'listings_data';
    this.EXCHANGE_RATE_CACHE_KEY = 'exchange_rate';
    
    // Cache durations (in seconds)
    this.REVENUE_CACHE_DURATION = parseInt(process.env.CACHE_DURATION) || 300; // 5 minutes
    this.LISTINGS_CACHE_DURATION = parseInt(process.env.LISTINGS_CACHE_DURATION) || 1800; // 30 minutes
    this.EXCHANGE_RATE_CACHE_DURATION = parseInt(process.env.EXCHANGE_RATE_CACHE_DURATION) || 3600; // 1 hour
    
    console.log('🚀 Cached Revenue Service initialized');
    console.log(`📊 Revenue cache duration: ${this.REVENUE_CACHE_DURATION}s`);
    console.log(`🏠 Listings cache duration: ${this.LISTINGS_CACHE_DURATION}s`);
    console.log(`💱 Exchange rate cache duration: ${this.EXCHANGE_RATE_CACHE_DURATION}s`);
  }

  /**
   * Get revenue data with caching
   */
  async getRevenueData() {
    const startTime = Date.now();
    
    try {
      // Try to get from cache first
      const cachedData = cacheService.get(this.REVENUE_CACHE_KEY);
      
      if (cachedData) {
        const cacheTime = Date.now() - startTime;
        console.log(`✅ Revenue data served from CACHE in ${cacheTime}ms`);
        return {
          ...cachedData,
          cached: true,
          cacheTime: cacheTime
        };
      }

      // If not in cache, fetch fresh data
      console.log('🔄 Fetching fresh revenue data (cache miss)...');
      const freshData = await getRevenueAndOccupancy();
      
      // Store in cache
      cacheService.set(this.REVENUE_CACHE_KEY, freshData, this.REVENUE_CACHE_DURATION);
      
      const fetchTime = Date.now() - startTime;
      console.log(`✅ Fresh revenue data fetched and cached in ${fetchTime}ms`);
      
      return {
        ...freshData,
        cached: false,
        fetchTime: fetchTime
      };
      
    } catch (error) {
      console.error('❌ Error in cached revenue service:', error.message);
      
      // Try to return stale cache data if available
      const staleData = cacheService.get(this.REVENUE_CACHE_KEY + '_stale');
      if (staleData) {
        console.log('⚠️ Returning stale cache data due to error');
        return {
          ...staleData,
          cached: true,
          stale: true,
          error: error.message
        };
      }
      
      throw error;
    }
  }

  /**
   * Force refresh cache
   */
  async refreshCache() {
    console.log('🔄 Force refreshing revenue cache...');
    
    // Clear existing cache
    cacheService.del(this.REVENUE_CACHE_KEY);
    
    // Fetch fresh data
    return await this.getRevenueData();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = cacheService.getStats();
    
    return {
      ...stats,
      revenueDataCached: cacheService.has(this.REVENUE_CACHE_KEY),
      listingsDataCached: cacheService.has(this.LISTINGS_CACHE_KEY),
      exchangeRateCached: cacheService.has(this.EXCHANGE_RATE_CACHE_KEY)
    };
  }

  /**
   * Clear all revenue-related cache
   */
  clearCache() {
    console.log('🧹 Clearing all revenue cache...');
    
    cacheService.del(this.REVENUE_CACHE_KEY);
    cacheService.del(this.LISTINGS_CACHE_KEY);
    cacheService.del(this.EXCHANGE_RATE_CACHE_KEY);
    
    console.log('✅ Revenue cache cleared');
  }

  /**
   * Warm up cache (pre-load data)
   */
  async warmUpCache() {
    console.log('🔥 Warming up revenue cache...');
    
    try {
      await this.getRevenueData();
      console.log('✅ Cache warmed up successfully');
    } catch (error) {
      console.error('❌ Failed to warm up cache:', error.message);
    }
  }
}

// Export singleton instance
module.exports = new CachedRevenueService();
