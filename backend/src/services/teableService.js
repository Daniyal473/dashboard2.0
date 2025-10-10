const axios = require('axios');
const config = require('../config/config');

class TeableService {
  constructor() {
    this.baseURL = config.TEABLE_BASE_URL;
    this.bearerToken = config.TEABLE_BEARER_TOKEN;
    this.headers = {
      'Authorization': `Bearer ${this.bearerToken}`,
      'Content-Type': 'application/json'
    };
    this.lastPostedTime = null; // Track last posting time - reset for testing
    
    // Local memory cache for posted records
    this.postedRecordsCache = new Map(); // Key: hour string, Value: record data
    this.lastPostedRecord = null; // Store the most recent posted record
  }

  /**
   * Get Pakistan date and time (UTC+5)
   * @returns {string} ISO formatted Pakistan date and time
   */
  getPakistanDateTime() {
    const now = new Date();
    // Create Pakistan time (UTC+5)
    const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    
    // Return ISO format: "2025-10-06T10:00:17.449Z"
    return pakistanTime.toISOString();
  }

  /**
   * Check if data already exists for current hour
   * @returns {Promise<boolean>} True if data exists, false if not
   */
  async checkIfDataExistsForCurrentHour() {
    try {
      // Get current Pakistan time properly
      const now = new Date();
      const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
      const currentHour = pakistanTime.getUTCHours();
      const currentDay = pakistanTime.getUTCDate();
      const currentMonth = pakistanTime.getUTCMonth();
      const currentYear = pakistanTime.getUTCFullYear();
      
      const currentHourString = `${currentYear}-${(currentMonth+1).toString().padStart(2,'0')}-${currentDay.toString().padStart(2,'0')} ${currentHour}:00`;
      console.log('🔍 Checking for existing data in Pakistan hour:', currentHourString);
      
      // FIRST: Check local memory cache (most reliable)
      if (this.postedRecordsCache.has(currentHourString)) {
        const cachedRecord = this.postedRecordsCache.get(currentHourString);
        console.log('🚫 BLOCKED BY LOCAL CACHE: Data already posted for this hour');
        console.log(`   Cached Record: ${cachedRecord.datetime} (ID: ${cachedRecord.id})`);
        return true;
      }
      
      // Show last posted record info
      if (this.lastPostedRecord) {
        console.log('📝 Last posted record in memory:', this.lastPostedRecord.datetime, '(ID:', this.lastPostedRecord.id + ')');
      }
      
      // For duplicate checking, we only need recent records (last 500 should be enough)
      const response = await this.getAllRecords(500);
      if (!response.success) {
        console.error('❌ Failed to fetch records for duplicate check:', response.error);
        throw new Error(`Cannot verify duplicates: ${response.error}`);
      }
      
      if (!response.data.records || response.data.records.length === 0) {
        console.log('✅ No existing records found in database');
        return false;
      }
      
      console.log(`🔍 Checking ${response.data.records.length} existing records...`);
      console.log(`🎯 Looking for matches with: ${currentHourString}`);
      
      // Debug: Show the most recent records first
      const sortedRecords = response.data.records.sort((a, b) => {
        const dateA = new Date(a.fields['Date and Time '] || 0);
        const dateB = new Date(b.fields['Date and Time '] || 0);
        return dateB.getTime() - dateA.getTime(); // Most recent first
      });
      
      console.log('🕐 Most recent 24 records:');
      for (let i = 0; i < Math.min(24, sortedRecords.length); i++) {
        const record = sortedRecords[i];
        const recordDateTime = record.fields['Date and Time '];
        console.log(`   ${i+1}. ${recordDateTime} (ID: ${record.id}, autoNumber: ${record.autoNumber})`);
      }
      
      // Check if any record has the same hour (focus on today's records)
      const todayRecords = response.data.records.filter(record => {
        const recordDateTime = record.fields['Date and Time '];
        if (!recordDateTime) return false;
        
        const recordDate = new Date(recordDateTime);
        const recordDay = recordDate.getUTCDate();
        const recordMonth = recordDate.getUTCMonth();
        const recordYear = recordDate.getUTCFullYear();
        
        // Only check records from today (same day)
        const isToday = recordDay === currentDay && 
                       recordMonth === currentMonth && 
                       recordYear === currentYear;
        
        if (isToday) {
          console.log(`📅 Today's record found: ${recordDateTime}`);
        }
        
        return isToday;
      });
      
      console.log(`🔍 Found ${todayRecords.length} records from today (${currentYear}-${(currentMonth+1).toString().padStart(2,'0')}-${currentDay.toString().padStart(2,'0')}) to check`);
      
      // Debug: Check if any records from current hour exist in the full dataset
      const currentHourRecords = response.data.records.filter(record => {
        const recordDateTime = record.fields['Date and Time '];
        if (!recordDateTime) return false;
        
        const recordDate = new Date(recordDateTime);
        const recordHour = recordDate.getUTCHours();
        const recordDay = recordDate.getUTCDate();
        const recordMonth = recordDate.getUTCMonth();
        const recordYear = recordDate.getUTCFullYear();
        
        return recordHour === currentHour && 
               recordDay === currentDay && 
               recordMonth === currentMonth && 
               recordYear === currentYear;
      });
      
      if (currentHourRecords.length > 0) {
        console.log(`🚨 FOUND ${currentHourRecords.length} records from current hour ${currentHour}:00 in database:`);
        currentHourRecords.forEach((record, idx) => {
          console.log(`   ${idx+1}. ${record.fields['Date and Time ']} (ID: ${record.id}, autoNumber: ${record.autoNumber})`);
        });
        console.log('🚫 BLOCKING POST - Data already exists for this hour!');
        return true;
      }
      
      for (let i = 0; i < todayRecords.length; i++) {
        const record = todayRecords[i];
        const recordDateTime = record.fields['Date and Time '];
        
        // Parse the stored datetime (already in Pakistan time ISO format)
        const recordDate = new Date(recordDateTime);
        const recordHour = recordDate.getUTCHours();
        const recordDay = recordDate.getUTCDate();
        const recordMonth = recordDate.getUTCMonth();
        const recordYear = recordDate.getUTCFullYear();
        
        const recordHourString = `${recordYear}-${(recordMonth+1).toString().padStart(2,'0')}-${recordDay.toString().padStart(2,'0')} ${recordHour}:00`;
        
        console.log(`📝 Today's Record ${i+1}: ${recordDateTime} → Pakistan hour: ${recordHourString}`);
        
        const isMatch = recordHour === currentHour && 
                       recordDay === currentDay && 
                       recordMonth === currentMonth && 
                       recordYear === currentYear;
        
        if (isMatch) {
          console.log('🚫 DUPLICATE FOUND! Existing record matches current Pakistan hour');
          console.log(`   Current: ${currentHourString}`);
          console.log(`   Existing: ${recordHourString}`);
          console.log(`   Record ID: ${record.id}`);
          return true;
        }
      }
      
      console.log('✅ No duplicate found for current Pakistan hour');
      return false;
    } catch (error) {
      console.error('❌ Error checking existing data:', error.message);
      throw error;
    }
  }

  /**
   * Check if one hour has passed since last post
   * @returns {boolean} True if can post, false if too soon
   */
  canPostNow() {
    if (!this.lastPostedTime) {
      return true; // First time posting
    }
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000)); // 1 hour ago
    
    return this.lastPostedTime < oneHourAgo;
  }

  /**
   * Get time remaining until next allowed post
   * @returns {number} Minutes remaining
   */
  getTimeUntilNextPost() {
    if (!this.lastPostedTime) {
      return 0;
    }
    
    const now = new Date();
    const nextAllowedTime = new Date(this.lastPostedTime.getTime() + (60 * 60 * 1000)); // 1 hour after last post
    const remainingMs = nextAllowedTime - now;
    
    return Math.max(0, Math.ceil(remainingMs / (60 * 1000))); // Convert to minutes
  }

  /**
   * Reset the posting cooldown (for testing)
   */
  resetCooldown() {
    this.lastPostedTime = null;
    console.log('🔄 Posting cooldown reset - can post immediately');
  }

  /**
   * Delete a record from Teable database
   * @param {string} recordId - The record ID to delete
   * @returns {Promise<Object>} Response from Teable API
   */
  async deleteRecord(recordId) {
    try {
      const deleteUrl = `${this.baseURL}/${recordId}`;
      
      console.log(`🗑️ Deleting record: ${recordId}`);
      
      const response = await axios.delete(deleteUrl, {
        headers: this.headers,
        timeout: 30000
      });

      console.log('✅ Successfully deleted record from Teable');
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error deleting record from Teable:', error.message);
      return {
        success: false,
        error: `Delete Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get all records from Teable database with dynamic pagination
   * @param {number} maxRecords - Maximum records to fetch (default: 500 for performance)
   * @returns {Promise<Object>} Response from Teable API
   */
  async getAllRecords(maxRecords = 500) {
    try {
      console.log(`📋 Fetching records from Teable with dynamic pagination (max: ${maxRecords})...`);
      
      const cacheBuster = Date.now();
      const pageSize = 100; // Teable's standard page size
      let allRecords = [];
      let currentPage = 0;
      let hasMoreRecords = true;
      const maxPages = Math.ceil(maxRecords / pageSize); // Safety limit
      
      while (hasMoreRecords && currentPage < maxPages) {
        const skip = currentPage * pageSize;
        const take = Math.min(pageSize, maxRecords - allRecords.length);
        
        console.log(`📄 Fetching page ${currentPage + 1}: skip=${skip}, take=${take}`);
        
        // Use Teable's pagination format: take & skip
        const url = `${this.baseURL}?take=${take}&skip=${skip}&_cb=${cacheBuster + currentPage}`;
        
        try {
          const response = await axios.get(url, {
            headers: {
              ...this.headers,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            timeout: 8000 // Timeout per page
          });
          
          const pageRecords = response.data.records || [];
          console.log(`   ✅ Page ${currentPage + 1}: Got ${pageRecords.length} records`);
          
          // Add records to collection
          allRecords.push(...pageRecords);
          
          // Check if we should continue
          if (pageRecords.length < take) {
            // Got fewer records than requested - this is the last page
            hasMoreRecords = false;
            console.log(`   🏁 Last page reached (got ${pageRecords.length} < ${take})`);
          } else if (allRecords.length >= maxRecords) {
            // Reached our maximum limit
            hasMoreRecords = false;
            console.log(`   🛑 Maximum records limit reached (${maxRecords})`);
          }
          
          currentPage++;
          
          // Small delay between requests to be nice to the API
          if (hasMoreRecords) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
        } catch (pageError) {
          console.error(`❌ Error fetching page ${currentPage + 1}:`, pageError.message);
          // If a page fails, stop pagination but return what we have
          hasMoreRecords = false;
        }
      }
      
      console.log(`✅ Dynamic pagination complete: ${allRecords.length} total records from ${currentPage} pages`);
      
      // Sort records by autoNumber descending (newest first) for consistency
      allRecords.sort((a, b) => {
        const autoA = a.autoNumber || 0;
        const autoB = b.autoNumber || 0;
        return autoB - autoA;
      });
      
      console.log(`🔄 Sorted ${allRecords.length} records by autoNumber (newest first)`);
      
      return {
        success: true,
        data: {
          records: allRecords,
          totalFetched: allRecords.length,
          pagesProcessed: currentPage,
          hasMore: currentPage >= maxPages && allRecords.length === maxRecords
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error in dynamic pagination:', error.message);
      return {
        success: false,
        error: `Pagination Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get ALL records from Teable database (unlimited pagination)
   * Use this when you need the complete dataset
   * @returns {Promise<Object>} Response with all records
   */
  async getAllRecordsUnlimited() {
    try {
      console.log('📋 Fetching ALL records from Teable (unlimited pagination)...');
      
      const cacheBuster = Date.now();
      const pageSize = 100;
      let allRecords = [];
      let currentPage = 0;
      let hasMoreRecords = true;
      const maxPages = 100; // Safety limit: 10,000 records max
      
      while (hasMoreRecords && currentPage < maxPages) {
        const skip = currentPage * pageSize;
        
        console.log(`📄 Fetching page ${currentPage + 1}: skip=${skip}, take=${pageSize}`);
        
        const url = `${this.baseURL}?take=${pageSize}&skip=${skip}&_cb=${cacheBuster + currentPage}`;
        
        try {
          const response = await axios.get(url, {
            headers: {
              ...this.headers,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
            timeout: 10000
          });
          
          const pageRecords = response.data.records || [];
          console.log(`   ✅ Page ${currentPage + 1}: Got ${pageRecords.length} records`);
          
          allRecords.push(...pageRecords);
          
          // Stop if we got fewer records than requested (last page)
          if (pageRecords.length < pageSize) {
            hasMoreRecords = false;
            console.log(`   🏁 Last page reached (got ${pageRecords.length} < ${pageSize})`);
          }
          
          currentPage++;
          
          // Progress update every 10 pages
          if (currentPage % 10 === 0) {
            console.log(`📊 Progress: ${allRecords.length} records fetched from ${currentPage} pages...`);
          }
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (pageError) {
          console.error(`❌ Error fetching page ${currentPage + 1}:`, pageError.message);
          hasMoreRecords = false;
        }
      }
      
      console.log(`✅ Unlimited pagination complete: ${allRecords.length} total records from ${currentPage} pages`);
      
      // Sort by autoNumber descending (newest first)
      allRecords.sort((a, b) => (b.autoNumber || 0) - (a.autoNumber || 0));
      
      return {
        success: true,
        data: {
          records: allRecords,
          totalFetched: allRecords.length,
          pagesProcessed: currentPage
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error in unlimited pagination:', error.message);
      return {
        success: false,
        error: `Unlimited Pagination Error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Post target data to Teable database
   * @param {Object} targetData - The target data to post
   * @param {string} targetData.actual - Daily Target Actual value
   * @param {string} targetData.achieved - Daily Target Achieved value
   * @returns {Promise<Object>} Response from Teable API
   */
  async postTargetData(targetData) {
    try {
      // Check if data already exists for current hour (PRIMARY CHECK)
      try {
        const dataExists = await this.checkIfDataExistsForCurrentHour();
        if (dataExists) {
          const pakistanDateTime = this.getPakistanDateTime();
          const currentDate = new Date(pakistanDateTime);
          const currentHour = `${currentDate.getUTCFullYear()}-${(currentDate.getUTCMonth()+1).toString().padStart(2,'0')}-${currentDate.getUTCDate().toString().padStart(2,'0')} ${currentDate.getUTCHours()}:00`;
          
          console.log('🚫 POSTING BLOCKED: Data already exists for this hour');
          return {
            success: false,
            error: `❌ DATA ALREADY POSTED: Revenue data for hour ${currentHour} (Pakistan Time) already exists in database. Only ONE post per hour is allowed to prevent duplicates.`,
            currentHour: currentHour,
            message: "Please wait until the next hour to post new data.",
            timestamp: new Date().toISOString()
          };
        }
      } catch (duplicateCheckError) {
        // If we can't check for duplicates, don't allow posting
        console.log('🚫 POSTING BLOCKED: Cannot verify duplicates');
        return {
          success: false,
          error: `❌ POSTING BLOCKED: Cannot verify if data already exists for this hour due to database connection error. Posting blocked to prevent duplicates.`,
          details: duplicateCheckError.message,
          timestamp: new Date().toISOString()
        };
      }

      const pakistanDateTime = this.getPakistanDateTime();
      
      const payload = {
        records: [
          {
            fields: {
              'Daily Target Actual': targetData.actual,
              'Daily Target Achieved': targetData.achieved,
              'Date and Time ': pakistanDateTime
            }
          }
        ]
      };

      console.log('📤 Posting to Teable:', payload);
      console.log('🇵🇰 Pakistan Date & Time:', pakistanDateTime);

      const response = await axios.post(this.baseURL, payload, {
        headers: this.headers,
        timeout: 30000 // 30 seconds timeout
      });

      console.log('✅ Successfully posted to Teable:', response.data);
      
      // Update last posted time on successful post
      this.lastPostedTime = new Date();
      
      // Cache the posted record in memory
      const currentDate = new Date(pakistanDateTime);
      const currentHourString = `${currentDate.getUTCFullYear()}-${(currentDate.getUTCMonth()+1).toString().padStart(2,'0')}-${currentDate.getUTCDate().toString().padStart(2,'0')} ${currentDate.getUTCHours()}:00`;
      const postedRecord = {
        id: response.data.records[0].id,
        autoNumber: response.data.records[0].autoNumber,
        datetime: pakistanDateTime,
        hourString: currentHourString,
        actual: targetData.actual,
        achieved: targetData.achieved
      };
      
      // Store in cache
      this.postedRecordsCache.set(currentHourString, postedRecord);
      this.lastPostedRecord = postedRecord;
      
      console.log('💾 Cached posted record:', postedRecord.datetime, '(ID:', postedRecord.id + ')');
      console.log('📊 Cache now contains', this.postedRecordsCache.size, 'hour(s)');
      
      return {
        success: true,
        data: response.data,
        pakistanDateTime: pakistanDateTime,
        cachedRecord: postedRecord,
        nextAllowedPostTime: new Date(this.lastPostedTime.getTime() + (60 * 60 * 1000)).toISOString(),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error posting to Teable:', error.message);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        return {
          success: false,
          error: `API Error: ${error.response.status} - ${error.response.data?.message || error.message}`,
          timestamp: new Date().toISOString()
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network Error: Unable to reach Teable API',
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: `Request Error: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }
    }
  }

  /**
   * Format revenue data for Teable posting
   * @param {Object} revenueData - Revenue data from revenueService
   * @returns {Object} Formatted data for Teable
   */
  formatRevenueDataForTeable(revenueData) {
    // Extract actual and expected revenue values
    const actualRevenue = parseFloat(revenueData.actualRevenue) || 0;
    const expectedRevenue = parseFloat(revenueData.expectedRevenue) || 0;
    
    // Format as currency strings (matching frontend format)
    const formatCurrency = (value) => {
      const numValue = parseFloat(value) || 0;
      if (numValue >= 1000000) {
        return `Rs${(numValue / 1000000).toFixed(1)}M`;
      } else if (numValue >= 1000) {
        return `Rs${(numValue / 1000).toFixed(0)}K`;
      }
      return `Rs${numValue.toLocaleString()}`;
    };

    return {
      actual: formatCurrency(actualRevenue),
      achieved: formatCurrency(expectedRevenue)
    };
  }

  /**
   * Test connection to Teable API
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      // Try to get table info or post a test record
      const pakistanDateTime = this.getPakistanDateTime();
      
      const testPayload = {
        records: [
          {
            fields: {
              'Daily Target Actual': 'Test Connection',
              'Daily Target Achieved': 'Test Connection',
              'Date and Time ': pakistanDateTime
            }
          }
        ]
      };

      const response = await axios.post(this.baseURL, testPayload, {
        headers: this.headers,
        timeout: 10000 // 10 seconds timeout for test
      });

      return {
        success: true,
        message: 'Teable API connection successful',
        status: response.status
      };

    } catch (error) {
      return {
        success: false,
        message: `Teable API connection failed: ${error.message}`,
        error: error.response?.data || error.message
      };
    }
  }
}

module.exports = TeableService;
