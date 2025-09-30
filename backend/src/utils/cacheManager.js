const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class CacheManager {
  constructor(cacheDir = './cache') {
    this.cacheDir = cacheDir;
    this.ensureCacheDir();
  }

  async ensureCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  getCacheKey(key, params = {}) {
    const keyString = key + JSON.stringify(params);
    return crypto.createHash('md5').update(keyString).digest('hex');
  }

  getCacheFilePath(cacheKey) {
    return path.join(this.cacheDir, `${cacheKey}.json`);
  }

  async get(cacheKey, maxAgeMinutes = 60) {
    try {
      const filePath = this.getCacheFilePath(cacheKey);
      const stats = await fs.stat(filePath);
      
      // Check if cache is expired
      const ageInMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60);
      if (ageInMinutes > maxAgeMinutes) {
        // Cache expired, delete file
        await fs.unlink(filePath);
        return null;
      }
      
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Cache miss or error reading cache
      return null;
    }
  }

  async set(cacheKey, data) {
    try {
      await this.ensureCacheDir();
      const filePath = this.getCacheFilePath(cacheKey);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing to cache:', error);
      return false;
    }
  }

  async delete(cacheKey) {
    try {
      const filePath = this.getCacheFilePath(cacheKey);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      // File might not exist
      return false;
    }
  }

  async clear() {
    try {
      const files = await fs.readdir(this.cacheDir);
      const deletePromises = files
        .filter(file => file.endsWith('.json'))
        .map(file => fs.unlink(path.join(this.cacheDir, file)));
      
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  async getStats() {
    try {
      const files = await fs.readdir(this.cacheDir);
      const cacheFiles = files.filter(file => file.endsWith('.json'));
      
      let totalSize = 0;
      const fileStats = await Promise.all(
        cacheFiles.map(async (file) => {
          const filePath = path.join(this.cacheDir, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
          return {
            file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
      );

      return {
        totalFiles: cacheFiles.length,
        totalSize,
        files: fileStats
      };
    } catch (error) {
      return {
        totalFiles: 0,
        totalSize: 0,
        files: []
      };
    }
  }
}

module.exports = CacheManager;
