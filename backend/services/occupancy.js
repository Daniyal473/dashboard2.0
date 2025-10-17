const axios = require('axios');

class OccupancyService {
  constructor() {
    this.teableApiUrl = 'https://teable.namuve.com/api/table/tblg8UqsmbyTMeZV1j8/record';
    this.bearerToken = 'teable_accSkoTP5GM9CQvPm4u_csIKhbkyBkfGhWK+6GsEqCbzRDpxu/kJJAorC0dxkhE=';
  }

  /**
   * Fetch occupancy data from Teable API
   */
  async fetchOccupancyData() {
    try {
      console.log('🏨 Fetching occupancy data from Teable...');
      
      if (!this.bearerToken) {
        throw new Error('TEABLE_BEARER_TOKEN not configured');
      }

      const response = await axios.get(this.teableApiUrl, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          viewId: 'viwW3FRhLdnavc9Qlas'
        }
      });

      console.log('📊 Raw Teable response:', response.data);
      
      if (response.data && response.data.records) {
        const processedData = this.processOccupancyData(response.data.records);
        console.log('✅ Processed occupancy data:', processedData);
        return processedData;
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where response.data is directly an array of records
        const processedData = this.processOccupancyData(response.data);
        console.log('✅ Processed occupancy data:', processedData);
        return processedData;
      } else {
        console.log('📊 Full response structure:', JSON.stringify(response.data, null, 2));
        throw new Error('Invalid response format from Teable API');
      }
    } catch (error) {
      console.error('❌ Error fetching occupancy data:', error.message);
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Process raw Teable data into occupancy report format
   */
  processOccupancyData(records) {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        timeZone: 'Asia/Karachi' 
      });

      // Initialize room types
      const roomTypes = {
        'Studio': { available: 0, reserved: 0, total: 0 },
        '1BR': { available: 0, reserved: 0, total: 0 },
        '2BR': { available: 0, reserved: 0, total: 0 },
        '2BR Premium': { available: 0, reserved: 0, total: 0 },
        '3BR': { available: 0, reserved: 0, total: 0 }
      };

      let totalRooms = 0;
      let totalReserved = 0;
      let reservedRoomsList = []; // Track which rooms are reserved

      // Process each record
      records.forEach((record, index) => {
        console.log(`🔍 Processing record ${index + 1}:`, JSON.stringify(record, null, 2));
        
        const fields = record.fields || record;
        
        // Extract room type from "Listing Name" field (e.g., "9F-85 (3B)" -> "3BR")
        const listingName = fields['Listing Name'] || fields.listingName || fields.name;
        const listingId = fields['Listing IDs'] || fields.listingId || fields.id;
        const activity = fields['Activity'] || fields.activity || fields.status;
        
        console.log(`📋 Record ${index + 1} - Listing: ${listingName}, ID: ${listingId}, Activity: ${activity}`);
        
        // Define 2BR Premium listing IDs
        const premiumListingIds = [305055, 309909, 323227, 288688];
        
        // Extract room type based on listing ID first, then listing name
        let roomType = null;
        
        // Check if this is a 2BR Premium based on listing ID
        if (listingId && premiumListingIds.includes(parseInt(listingId))) {
          roomType = '2BR Premium';
        } else if (listingName) {
          // Use listing name for other room types
          if (listingName.includes('(3B)') || listingName.includes('3BR')) {
            roomType = '3BR';
          } else if (listingName.includes('(2B)') || listingName.includes('2BR')) {
            roomType = '2BR';
          } else if (listingName.includes('(1B)') || listingName.includes('1BR')) {
            roomType = '1BR';
          } else if (listingName.includes('Studio') || listingName.includes('(S)')) {
            roomType = 'Studio';
          }
        }
        
        // Determine if room is reserved/occupied (not vacant or checkin)
        const isReserved = activity !== 'Vacant' && activity !== 'vacant' && 
                          activity !== 'Available' && activity !== 'available' &&
                          activity !== 'Checkin' && activity !== 'checkin' &&
                          activity !== 'N/A' && activity && activity.trim() !== '';

        console.log(`🔍 Activity check for ${listingName}: "${activity}" -> Reserved: ${isReserved}`);

        if (roomType && roomTypes[roomType]) {
          roomTypes[roomType].total++;
          totalRooms++;

          if (isReserved) {
            roomTypes[roomType].reserved++;
            totalReserved++;
            reservedRoomsList.push(`${listingName} (${roomType}) - Activity: "${activity}"`);
            console.log(`🔴 RESERVED: ${roomType} - ${listingName} (Activity: "${activity}")`);
          } else {
            roomTypes[roomType].available++;
            console.log(`🟢 AVAILABLE: ${roomType} - ${listingName} (Activity: "${activity}")`);
          }
          console.log(`✅ Added ${roomType} - Reserved: ${isReserved} | Running totals - Total: ${totalRooms}, Reserved: ${totalReserved}`);
        } else if (roomType) {
          console.log(`⚠️ Unknown room type: ${roomType}`);
        }
      });

      console.log(`📊 Final totals - Total Rooms: ${totalRooms}, Reserved: ${totalReserved}`);
      
      // Debug: Show final breakdown by room type
      console.log('📊 FINAL BREAKDOWN BY ROOM TYPE:');
      Object.entries(roomTypes).forEach(([type, data]) => {
        console.log(`   ${type}: Total=${data.total}, Available=${data.available}, Reserved=${data.reserved}`);
      });
      
      // Calculate total reserved from room types to verify
      const calculatedReserved = Object.values(roomTypes).reduce((sum, data) => sum + data.reserved, 0);
      console.log(`🔍 Calculated Reserved from room types: ${calculatedReserved}`);
      console.log(`🔍 Tracked Reserved from counter: ${totalReserved}`);
      
      if (calculatedReserved !== totalReserved) {
        console.log(`⚠️ MISMATCH DETECTED! Using calculated value: ${calculatedReserved}`);
        totalReserved = calculatedReserved;
      }
      
      // Show all reserved rooms
      console.log(`📋 LIST OF ALL ${reservedRoomsList.length} RESERVED ROOMS:`);
      reservedRoomsList.forEach((room, index) => {
        console.log(`   ${index + 1}. ${room}`);
      });

      // If no data was processed, return empty structure
      if (totalRooms === 0) {
        console.log('⚠️ No room data found in Teable response');
        return {
          reportDate: currentDate,
          reportTime: currentTime,
          occupancyRate: 0,
          totalRooms: 0,
          totalReserved: 0,
          totalAvailable: 0,
          roomTypes: {},
          lastUpdated: new Date().toISOString(),
          error: 'No room data found in Teable API response'
        };
      }

      
      // Calculate occupancy rate
      const occupancyRate = totalRooms > 0 ? ((totalReserved / totalRooms) * 100).toFixed(2) : 0;

      return {
        reportDate: currentDate,
        reportTime: currentTime,
        occupancyRate: parseFloat(occupancyRate),
        totalRooms,
        totalReserved,
        totalAvailable: totalRooms - totalReserved,
        roomTypes: Object.entries(roomTypes)
          .filter(([_, data]) => data.total > 0)
          .reduce((acc, [type, data]) => {
            acc[type] = data;
            return acc;
          }, {}),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error processing occupancy data:', error);
      throw new Error('Failed to process occupancy data');
    }
  }

  /**
   * Generate formatted occupancy report
   */
  generateReport(data) {
    const { reportDate, reportTime, occupancyRate, totalReserved, totalRooms, roomTypes } = data;
    
    let report = `Daily Occupancy & Revenue Report (${reportDate})\n\n`;
    report += `🕒 Report Period: ${reportDate}, 12:00 AM - ${reportTime}\n`;
    report += `📈 Occupancy Rate: ${occupancyRate}% (Reserved: ${totalReserved} / Total: ${totalRooms})\n\n`;
    report += `🏨 Room Availability:\n`;

    Object.entries(roomTypes).forEach(([type, data]) => {
      report += `${type}: Available ${data.available} | Reserved ${data.reserved}\n\n`;
    });

    return report;
  }

  /**
   * Get current occupancy status
   */
  async getCurrentOccupancy() {
    try {
      const data = await this.fetchOccupancyData();
      return {
        success: true,
        data,
        report: this.generateReport(data)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

module.exports = new OccupancyService();
