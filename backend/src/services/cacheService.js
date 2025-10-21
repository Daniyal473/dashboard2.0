const NodeCache = require('node-cache');

class CacheService {
  constructor() {
    // Initialize in-memory cache with 5-minute default TTL
    this.cache = new NodeCache({ 
      stdTTL: 300, // 5 minutes default
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false // Better performance
    });
    
    console.log('🚀 Cache Service initialized with 5-minute TTL');
  }

  /**
   * Get value from cache
   */
  get(key) {
    const value = this.cache.get(key);
    if (value !== undefined) {
      console.log(`✅ Cache HIT for key: ${key}`);
      return value;
    }
    console.log(`❌ Cache MISS for key: ${key}`);
    return null;
  }

  /**
   * Set value in cache with optional TTL
   */
  set(key, value, ttl = null) {
    const success = this.cache.set(key, value, ttl || 300);
    if (success) {
      console.log(`💾 Cache SET for key: ${key} (TTL: ${ttl || 300}s)`);
    }
    return success;
  }

  /**
   * Delete key from cache
   */
  del(key) {
    const deleted = this.cache.del(key);
    if (deleted > 0) {
      console.log(`🗑️ Cache DELETE for key: ${key}`);
    }
    return deleted;
  }

  /**
   * Check if key exists in cache
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      keys: this.cache.keys().length,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses,
      ksize: this.cache.getStats().ksize,
      vsize: this.cache.getStats().vsize
    };
  }

  /**
   * Clear all cache
   */
  flush() {
    this.cache.flushAll();
    console.log('🧹 Cache FLUSHED - All keys cleared');
  }

  /**
   * Get or set pattern - fetch data if not in cache
   */
  async getOrSet(key, fetchFunction, ttl = 300) {
    // Try to get from cache first
    let value = this.get(key);
    
    if (value !== null) {
      return value;
    }

    // If not in cache, fetch the data
    console.log(`🔄 Fetching fresh data for key: ${key}`);
    try {
      value = await fetchFunction();
      
      // Store in cache
      this.set(key, value, ttl);
      
      return value;
    } catch (error) {
      console.error(`❌ Error fetching data for key ${key}:`, error.message);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new CacheService();
