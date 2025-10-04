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
  }

  /**
   * Get Pakistan date and time (UTC+5)
   * @returns {string} Formatted Pakistan date and time
   */
  getPakistanDateTime() {
    const now = new Date();
    // Create Pakistan time (UTC+5)
    const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    
    // Format as DD/MM/YYYY, HH:MM:SS
    const day = pakistanTime.getUTCDate().toString().padStart(2, '0');
    const month = (pakistanTime.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = pakistanTime.getUTCFullYear();
    const hours = pakistanTime.getUTCHours().toString().padStart(2, '0');
    const minutes = pakistanTime.getUTCMinutes().toString().padStart(2, '0');
    const seconds = pakistanTime.getUTCSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Check if data already exists for current hour
   * @returns {Promise<boolean>} True if data exists, false if not
   */
  async checkIfDataExistsForCurrentHour() {
    try {
      const pakistanDateTime = this.getPakistanDateTime();
      // Extract date and hour properly: "03/10/2025, 11" (ensure we get full hour)
      const datePart = pakistanDateTime.substring(0, 10); // "03/10/2025"
      const timePart = pakistanDateTime.substring(12); // "11:36:56"
      const hourPart = timePart.substring(0, 2); // "11"
      const currentHour = `${datePart}, ${hourPart}`; // "03/10/2025, 11"
      
      console.log('🔍 Checking for existing data in hour:', currentHour);
      
      const response = await this.getAllRecords();
      if (!response.success) {
        console.error('❌ Failed to fetch records for duplicate check:', response.error);
        // If we can't check for duplicates due to network error, 
        // we should NOT allow posting to prevent duplicates
        throw new Error(`Cannot verify duplicates: ${response.error}`);
      }
      
      if (!response.data.records) {
        console.log('✅ No existing records found');
        return false;
      }
      
      // Check if any record has the same hour
      const existingRecord = response.data.records.find(record => {
        const recordDateTime = record.fields['Date and Time '];
        if (!recordDateTime) return false;
        
        // Extract hour from existing record in same format
        const recordDatePart = recordDateTime.substring(0, 10); // "03/10/2025"
        const recordTimePart = recordDateTime.substring(12); // "10:01:10"
        const recordHourPart = recordTimePart.substring(0, 2); // "10"
        const recordHour = `${recordDatePart}, ${recordHourPart}`; // "03/10/2025, 10"
        
        return recordHour === currentHour;
      });
      
      if (existingRecord) {
        console.log('⚠️ Found existing record for this hour:', existingRecord.fields['Date and Time ']);
        return true;
      }
      
      console.log('✅ No duplicate found for current hour');
      return false;
    } catch (error) {
      console.error('❌ Error checking existing data:', error.message);
      // Throw error instead of returning false to prevent posting when we can't verify
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
   * Get all records from Teable database
   * @returns {Promise<Object>} Response from Teable API
   */
  async getAllRecords() {
    try {
      console.log('📋 Fetching all records from Teable...');
      
      const response = await axios.get(this.baseURL, {
        headers: this.headers,
        timeout: 10000 // Reduced timeout for duplicate checking
      });

      console.log('✅ Successfully fetched records from Teable');
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error fetching records from Teable:', error.message);
      return {
        success: false,
        error: `Fetch Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
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
      // Check if data already exists for current hour
      try {
        const dataExists = await this.checkIfDataExistsForCurrentHour();
        if (dataExists) {
          const pakistanDateTime = this.getPakistanDateTime();
          const currentHour = pakistanDateTime.substring(0, 13);
          return {
            success: false,
            error: `❌ ERROR: Data already exists for hour ${currentHour}. Only one post per hour is allowed.`,
            currentHour: currentHour,
            timestamp: new Date().toISOString()
          };
        }
      } catch (duplicateCheckError) {
        // If we can't check for duplicates, don't allow posting
        return {
          success: false,
          error: `❌ ERROR: Cannot post data - unable to verify duplicates due to network error: ${duplicateCheckError.message}`,
          timestamp: new Date().toISOString()
        };
      }

      // Check if we can post now (1 hour cooldown)
      if (!this.canPostNow()) {
        const remainingMinutes = this.getTimeUntilNextPost();
        return {
          success: false,
          error: `Data already posted for this hour. Please wait ${remainingMinutes} minutes before posting again.`,
          remainingMinutes: remainingMinutes,
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
      
      return {
        success: true,
        data: response.data,
        pakistanDateTime: pakistanDateTime,
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
