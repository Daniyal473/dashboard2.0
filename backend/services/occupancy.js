const axios = require('axios');
const config = require('../src/config/config');

class OccupancyService {
  constructor() {
    this.teableApiUrl = 'https://teable.namuve.com/api/table/tblg8UqsmbyTMeZV1j8/record';
    this.bearerToken = 'teable_accSkoTP5GM9CQvPm4u_csIKhbkyBkfGhWK+6GsEqCbzRDpxu/kJJAorC0dxkhE=';
    this.hostawayAuthToken = config.HOSTAWAY_AUTH_TOKEN;
  }

  /**
   * Fetch actual checked-in reservations from Hostaway API
   */
  async fetchActualCheckedInReservations() {
    try {
      console.log('🏨 Fetching reservations with actual check-in times from Hostaway...');
      
      if (!this.hostawayAuthToken) {
        throw new Error('HOSTAWAY_AUTH_TOKEN not configured');
      }

      // Get current date in Pakistan timezone (UTC+5)
      const now = new Date();
      const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
      const formattedToday = pakistanTime.getFullYear() + '-' + 
        String(pakistanTime.getMonth() + 1).padStart(2, '0') + '-' + 
        String(pakistanTime.getDate()).padStart(2, '0');

      const baseReservationsUrl = 'https://api.hostaway.com/v1/reservations?includeResources=1';
      
      const response = await axios.get(baseReservationsUrl, {
        headers: {
          Authorization: this.hostawayAuthToken,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      const allReservations = response.data.result || [];
      let actualCheckedInCount = 0;
      const checkedInListings = [];

      if (allReservations && allReservations.length > 0) {
        // Filter reservations to include only those with status "new" or "modified" and where today is within the stay period
        const reservations = allReservations.filter(res => {
          if (!res.arrivalDate || !res.departureDate) return false;
          if (!['new', 'modified'].includes(res.status)) return false;
          
          const arrival = new Date(res.arrivalDate);
          const departure = new Date(res.departureDate);
          const todayDate = new Date(formattedToday);
          const isInStayPeriod = (todayDate >= arrival && todayDate < departure);
          
          if (!isInStayPeriod) return false;
          
          // Check for test guests
          const guestName = res.guestName || res.firstName || res.lastName || 
                           res.guest?.firstName || res.guest?.lastName || 
                           res.guestFirstName || res.guestLastName || '';
          const isTestGuest = !guestName ||
            /test|testing|guests|new guest|test guest|new/i.test(guestName) ||
            (res.comment && /test|testing|new guest/i.test(res.comment)) ||
            (res.guestNote && /test|testing|new guest/i.test(res.guestNote));
            
          return !isTestGuest;
        });

        // Process each reservation to check for actual check-in time
        for (const res of reservations) {
          let updatedRes = res;
          
          // Fetch updated details if the reservation is new or modified
          if (res.status === 'modified' || res.status === 'new') {
            try {
              const updatedResResponse = await axios.get(`https://api.hostaway.com/v1/reservations/${res.id}?includeResources=1`, {
                headers: {
                  Authorization: this.hostawayAuthToken,
                  'Content-Type': 'application/json'
                },
                timeout: 30000
              });
              const updatedResData = updatedResResponse.data;
              if (updatedResData && updatedResData.result) {
                updatedRes = updatedResData.result;
              }
            } catch (updateError) {
              // Silent error handling
            }
          }

          const arrival = new Date(updatedRes.arrivalDate);
          const departure = new Date(updatedRes.departureDate);
          const todayDate = new Date(formattedToday);
          
          if (todayDate >= arrival && todayDate < departure) {
            // Get custom fields from the correct property: customFieldValues
            let customFields = [];
            
            if (updatedRes.customFieldValues && Array.isArray(updatedRes.customFieldValues)) {
              customFields = updatedRes.customFieldValues;
            }
            
            // Check for "Actual Check-in Time" field (ID: 76281)
            const hasCheckedIn = customFields && 
              customFields.some(fieldValue => {
                return fieldValue.customFieldId === 76281 && 
                  fieldValue.customField?.name === "Actual Check-in Time" && 
                  fieldValue.value && 
                  fieldValue.value.trim() !== "";
              });
              
            if (hasCheckedIn) {
              actualCheckedInCount++;
              checkedInListings.push({
                listingId: updatedRes.listingMapId,
                guestName: updatedRes.guestName || updatedRes.firstName || updatedRes.lastName || 'Unknown Guest',
                reservationId: updatedRes.id
              });
            }
          }
        }
      }

      console.log(`✅ Found ${actualCheckedInCount} reservations with actual check-in times`);
      console.log(`📋 Checked-in listings:`, checkedInListings);
      
      return {
        actualCheckedInCount,
        checkedInListings
      };

    } catch (error) {
      console.error('❌ Error fetching actual checked-in reservations:', error.message);
      return {
        actualCheckedInCount: 0,
        checkedInListings: []
      };
    }
  }

  /**
   * Fetch occupancy data using actual check-in times from Hostaway
   */
  async fetchOccupancyData() {
    try {
      console.log('🏨 Fetching occupancy data using actual check-in times...');
      
      // Get actual checked-in reservations from Hostaway
      const checkedInData = await this.fetchActualCheckedInReservations();
      
      // Get room inventory from Teable for total room count
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
        const processedData = this.processOccupancyData(response.data.records, checkedInData);
        console.log('✅ Processed occupancy data:', processedData);
        return processedData;
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where response.data is directly an array of records
        const processedData = this.processOccupancyData(response.data, checkedInData);
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
   * Process raw Teable data into occupancy report format using actual check-in data
   */
  processOccupancyData(records, checkedInData = { actualCheckedInCount: 0, checkedInListings: [] }) {
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

      // Process each record to get room inventory and match with actual check-ins
      records.forEach((record, index) => {
        console.log(`🔍 Processing record ${index + 1}:`, JSON.stringify(record, null, 2));
        
        const fields = record.fields || record;
        
        // Extract room type from "Listing Name" field (e.g., "9F-85 (3B)" -> "3BR")
        const listingName = fields['Listing Name'] || fields.listingName || fields.name;
        const listingId = fields['Listing IDs'] || fields.listingId || fields.id;
        
        console.log(`📋 Record ${index + 1} - Listing: ${listingName}, ID: ${listingId}`);
        
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
        
        // Determine if room is occupied based on actual check-in data from Hostaway
        const isOccupied = checkedInData.checkedInListings.some(checkedIn => 
          String(checkedIn.listingId) === String(listingId)
        );

        console.log(`🔍 Check-in status for ${listingName} (ID: ${listingId}): Occupied: ${isOccupied}`);

        if (roomType && roomTypes[roomType]) {
          roomTypes[roomType].total++;
          totalRooms++;

          if (isOccupied) {
            roomTypes[roomType].reserved++;
            totalReserved++;
            const checkedInGuest = checkedInData.checkedInListings.find(checkedIn => 
              String(checkedIn.listingId) === String(listingId)
            );
            reservedRoomsList.push(`${listingName} (${roomType}) - Guest: "${checkedInGuest?.guestName || 'Unknown'}"`);
            console.log(`🔴 OCCUPIED: ${roomType} - ${listingName} (Guest: "${checkedInGuest?.guestName || 'Unknown'}")`);
          } else {
            roomTypes[roomType].available++;
            console.log(`🟢 AVAILABLE: ${roomType} - ${listingName} (No actual check-in)`);
          }
          console.log(`✅ Added ${roomType} - Occupied: ${isOccupied} | Running totals - Total: ${totalRooms}, Occupied: ${totalReserved}`);
        } else if (roomType) {
          console.log(`⚠️ Unknown room type: ${roomType}`);
        }
      });

      console.log(`📊 Final totals - Total Rooms: ${totalRooms}, Occupied (with actual check-ins): ${totalReserved}`);
      
      // Debug: Show final breakdown by room type
      console.log('📊 FINAL BREAKDOWN BY ROOM TYPE (BASED ON ACTUAL CHECK-INS):');
      Object.entries(roomTypes).forEach(([type, data]) => {
        console.log(`   ${type}: Total=${data.total}, Available=${data.available}, Occupied=${data.reserved}`);
      });
      
      // Calculate total occupied from room types to verify
      const calculatedOccupied = Object.values(roomTypes).reduce((sum, data) => sum + data.reserved, 0);
      console.log(`🔍 Calculated Occupied from room types: ${calculatedOccupied}`);
      console.log(`🔍 Tracked Occupied from counter: ${totalReserved}`);
      console.log(`🔍 Hostaway check-ins count: ${checkedInData.actualCheckedInCount}`);
      
      if (calculatedOccupied !== totalReserved) {
        console.log(`⚠️ MISMATCH DETECTED! Using calculated value: ${calculatedOccupied}`);
        totalReserved = calculatedOccupied;
      }
      
      // Verify that our count matches Hostaway data
      if (totalReserved !== checkedInData.actualCheckedInCount) {
        console.log(`⚠️ OCCUPANCY MISMATCH: Room type count (${totalReserved}) != Hostaway count (${checkedInData.actualCheckedInCount})`);
        console.log(`🔍 This could mean some listings are missing from Teable or room type mapping is incorrect`);
      }
      
      // Show all occupied rooms (with actual check-ins)
      console.log(`📋 LIST OF ALL ${reservedRoomsList.length} OCCUPIED ROOMS (WITH ACTUAL CHECK-INS):`);
      reservedRoomsList.forEach((room, index) => {
        console.log(`   ${index + 1}. ${room}`);
      });
      
      console.log(`\n=== OCCUPANCY CALCULATION SUMMARY ===`);
      console.log(`🏨 Total Rooms: ${totalRooms}`);
      console.log(`✅ Actual Checked-In Count: ${checkedInData.actualCheckedInCount}`);
      console.log(`📊 Occupancy Rate: ${totalRooms > 0 ? ((totalReserved / totalRooms) * 100).toFixed(2) : 0}% (${totalReserved}/${totalRooms})`);
      console.log(`🔍 Based on: Hostaway reservations with populated 'Actual Check-in Time' field`);
      console.log(`=======================================`);

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
