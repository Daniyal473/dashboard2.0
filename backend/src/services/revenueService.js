const fs = require('fs').promises;
const config = require('../config/config');
const { makeRequestWithRetry, RateLimiter } = require('../utils/apiHelper');
const CacheManager = require('../utils/cacheManager');
const axios = require('../utils/connectionPool');
const errorHandler = require('../utils/errorHandler');


const LISTINGS_DATA = {
  Studio: [288682, 288690, 323229, 323261, 336255, 383744, 410263, 413218],
  '1BR': [307143, 306032, 288691, 305069, 288681, 288726, 288679, 288723, 288678, 323258, 400763],
  '2BR': [288677, 288684, 288687, 288977, 288685, 288683, 306543, 288724, 378076, 378078, 400779, 400769, 395345, 414090, 421015, 422302],
  '2BR Premium': [305055, 309909, 323227, 288688],
  '3BR': [288686, 305327, 288676, 389366],
};


async function getRevenueAndOccupancy() {
  const authToken = config.HOSTAWAY_AUTH_TOKEN;
  const cache = new CacheManager();


  // Initialize properties in memory
  let properties = { 
    lastUpdatedDate: null, 
    totalRevenue: '0', 
    categoryAvailability: {} 
  };


  const today = new Date().toISOString().split('T')[0];


  if (properties.lastUpdatedDate !== today) {
    properties.lastUpdatedDate = today;
    properties.totalRevenue = '0';
    properties.categoryAvailability = {};
  }


  let totalRevenue = parseFloat(properties.totalRevenue || '0');
  let categoryAvailability = properties.categoryAvailability || {};
  
  // Initialize daily revenue tracking
  let dailyRevenue = 0;
  
  // Initialize actual and expected revenue tracking
  let actualRevenue = 0;
  let expectedRevenue = 0;
  let occupancyRate = 0;


  // Create a flat array of all listing IDs from LISTINGS_DATA
  const allowedListingIds = Object.values(LISTINGS_DATA).flat();


  // Initialize room availability per category
  Object.keys(LISTINGS_DATA).forEach(category => {
    categoryAvailability[category] = { available: 0, reserved: 0 };
  });


  const options = {
    headers: { Authorization: authToken, 'Content-Type': 'application/json' },
  };

  try {
    // Process calendar data with parallel requests and better error handling
  
  const processListing = async (listingId, category) => {
    const cacheKey = cache.getCacheKey(`calendar_${listingId}` , { date: today });
    
    // Try to get from cache first (10 minute cache for better performance)
    let calendarData = await cache.get(cacheKey, 10);
    let fromCache = !!calendarData;
    
    if (!calendarData) {
      const calendarUrl = `https://api.hostaway.com/v1/listings/${listingId}/calendar?startDate=${today}&endDate=${today}` ;
      
      try {
        const response = await errorHandler.makeApiCall(calendarUrl, {
          headers: {
            Authorization: authToken,
            'Content-Type': 'application/json'
          }
        });
        
        calendarData = response.data;
        
        // Cache the successful response
        await cache.set(cacheKey, calendarData);
        
      } catch (error) {
        // Create default data structure for failed requests
        calendarData = { result: [{ status: 'available' }] };
      }
    }
    
    // Process the calendar data
    let status = 'available';
    if (calendarData?.result?.length > 0) {
      status = calendarData.result[0].status;
    }
    
    return { listingId, category, status, fromCache };
  };
  
  // Process all listings in parallel with controlled concurrency
  const allListings = [];
  for (const [category, listings] of Object.entries(LISTINGS_DATA)) {
    for (const listingId of listings) {
      allListings.push({ listingId, category });
    }
  }
  
  // Process in larger batches for better performance
  const batchSize = 10;
  
  for (let i = 0; i < allListings.length; i += batchSize) {
    const batch = allListings.slice(i, i + batchSize);
    
    const batchPromises = batch.map(({ listingId, category }) => 
      processListing(listingId, category)
    );
    
    const results = await Promise.allSettled(batchPromises);
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { category, status } = result.value;
        if (status === 'reserved') {
          categoryAvailability[category].reserved++;
        } else {
          categoryAvailability[category].available++;
        }
      } else {
        // Handle rejected promises
        const { category } = batch[index];
        categoryAvailability[category].available++;
      }
    });
    
    // Shorter delay between batches
    if (i + batchSize < allListings.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }


  // Calculate occupancy rate
  let totalAvailable = 0, totalReserved = 0;
  Object.values(categoryAvailability).forEach(({ available, reserved }) => {
    totalAvailable += available;
    totalReserved += reserved;
  });
  const totalRooms = totalAvailable + totalReserved;
  occupancyRate = totalRooms > 0 ? parseFloat(((totalReserved / totalRooms) * 100).toFixed(2)) : 0;


  // API endpoints - include resources in the response
  const reservationsUrl = 'https://api.hostaway.com/v1/reservations?includeResources=1';
  const financeUrl = 'https://api.hostaway.com/v1/financeStandardField/reservation/';
  const exchangeRateUrl = 'https://v6.exchangerate-api.com/v6/cbb36a5aeba2aa9dbaa251e0/latest/USD';


  // Get current date in Pakistan timezone (UTC+5)
  const now = new Date();
  const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000)); // Add 5 hours for Pakistan timezone
  const formattedToday = pakistanTime.getFullYear() + '-' + String(pakistanTime.getMonth() + 1).padStart(2, '0') + '-' + String(pakistanTime.getDate()).padStart(2, '0');
  
  // Define the finance fields to process
  const readableFieldNames = {
    baseRate: 'Base Rate',
  };


  // Get latest USD to PKR exchange rate with error handling
  let usdToPkr = 279;
  try {
    const exchangeResponse = await errorHandler.makeApiCall(exchangeRateUrl);
    const exchangeData = exchangeResponse.data;
    if (exchangeData.conversion_rates && exchangeData.conversion_rates.PKR) {
      usdToPkr = exchangeData.conversion_rates.PKR;
    }
  } catch (error) {
    // Silent fallback to default rate
  }


  try {
    const response = await errorHandler.makeApiCall(reservationsUrl, {
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json'
      }
    });
    const data = response.data;
    const breakdown = {};


    if (data && data.result) {
      // Filter reservations to include only those with status "new" or "modified" and where today is within the stay period
      let filteredOut = { noDate: 0, wrongStatus: 0, wrongListing: 0, outsideStay: 0, testGuest: 0 };
      
      const reservations = data.result.filter(res => {
        // Check missing dates
        if (!res.arrivalDate || !res.departureDate) {
          filteredOut.noDate++;
          return false;
        }
        
        // Check status
        if (!['new', 'modified'].includes(res.status)) {
          filteredOut.wrongStatus++;
          return false;
        }
        
        // Check if listing is in allowed list
        if (!allowedListingIds.includes(Number(res.listingMapId))) {
          filteredOut.wrongListing++;
          return false;
        }
        
        // Check date range
        const arrival = new Date(res.arrivalDate);
        const departure = new Date(res.departureDate);
        const todayDate = new Date(formattedToday);
        const isInStayPeriod = (todayDate >= arrival && todayDate < departure);
        
        if (!isInStayPeriod) {
          filteredOut.outsideStay++;
          return false;
        }
        
        // Check for test guests
        const guestName = res.guestName || res.firstName || res.lastName || 
                         res.guest?.firstName || res.guest?.lastName || 
                         res.guestFirstName || res.guestLastName || '';
        const isTestGuest = !guestName ||
          /test|testing|guests|new guest|test guest|new/i.test(guestName) ||
          (res.comment && /test|testing|new guest/i.test(res.comment)) ||
          (res.guestNote && /test|testing|new guest/i.test(res.guestNote));
          
        if (isTestGuest) {
          filteredOut.testGuest++;
          return false;
        }
        
        return true;
      });
      
      // Store total reservations count for final summary
      const totalReservations = reservations.length;


      // Process each reservation
      for (const res of reservations) {
        // Debug: Log the first reservation structure
        if (reservations.indexOf(res) === 0) {
          console.log('Sample reservation structure (first reservation):');
          console.log('Keys available:', Object.keys(res));
          console.log('Custom fields in original reservation:', res.customField);
          console.log('Custom fields in original reservation (detailed):', JSON.stringify(res.customField, null, 2));
        }
        
        // Fetch updated details if the reservation is new or modified
        let updatedRes = res;
        if (res.status === 'modified' || res.status === 'new') {
          try {
            // Try multiple API endpoints to get complete reservation data
            let updatedResResponse;
            
            // First try: Standard reservation endpoint with all includes
            try {
              updatedResResponse = await errorHandler.makeApiCall(`https://api.hostaway.com/v1/reservations/${res.id}?include=customFields,listing,guest,messages,payments` , {
                headers: {
                  Authorization: authToken,
                  'Content-Type': 'application/json'
                }
              });
              console.log(`✅ Got reservation details with include parameters`);
            } catch (includeError) {
              console.log(`❌ Include parameters failed, trying basic endpoint`);
              
              // Fallback: Basic reservation endpoint
              updatedResResponse = await errorHandler.makeApiCall(`https://api.hostaway.com/v1/reservations/${res.id}` , {
                headers: {
                  Authorization: authToken,
                  'Content-Type': 'application/json'
                }
              });
            }
            const updatedResData = updatedResResponse.data;
            if (updatedResData && updatedResData.result) {
              updatedRes = updatedResData.result;
              
              // Debug updated reservation custom fields
              if (reservations.indexOf(res) === 0) {
                console.log('=== COMPLETE RESERVATION STRUCTURE ===');
                console.log('Updated reservation keys:', Object.keys(updatedRes));
                console.log('Updated reservation custom fields:', updatedRes.customField);
                console.log('Updated reservation customFields:', updatedRes.customFields);
                console.log('Updated reservation custom_fields:', updatedRes.custom_fields);
                console.log('Updated reservation fields:', updatedRes.fields);
                console.log('Updated reservation additionalFields:', updatedRes.additionalFields);
                console.log('=== FULL RESERVATION OBJECT (first 500 chars) ===');
                console.log(JSON.stringify(updatedRes, null, 2).substring(0, 500) + '...');
                console.log('=== END RESERVATION DEBUG ===');
              }
            }
          } catch (updateError) {
            // Silent error handling
          }
        }


        // Convert arrival and departure dates to Date objects for comparison
        const arrival = new Date(updatedRes.arrivalDate);
        const departure = new Date(updatedRes.departureDate);
        const todayDate = new Date(formattedToday);
        if (todayDate < arrival || todayDate >= departure) {
          continue;
        }


        // Check if guest is staying TODAY only (not cumulative)
        const todayOnly = todayDate >= arrival && todayDate < departure;
        
        if (!todayOnly) {
          continue;
        }


        // Fetch finance details for the reservation with retry logic
        try {
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Use enhanced error handler for finance API calls
          const financeResponse = await errorHandler.makeFinanceCall(
            financeUrl + updatedRes.id,
            authToken,
            updatedRes.id
          );
          
          const financeData = financeResponse.data;
          if (financeData.status === 'success' && financeData.result) {
            let reservationTotal = 0;
            const reservationBreakdown = {};


            // Check for "Actual Check-in Time" custom field (ID: 76281)
            const hasCheckedIn = updatedRes.customField && 
              updatedRes.customField.some(field => 
                field.id === 76281 && 
                field.name === "Actual Check-in Time" && 
                field.value && 
                field.value.trim() !== ""
              );


            Object.keys(readableFieldNames).forEach(field => {
              let value = 0;
              if (field === 'baseRate') {
                let totalBookingNights = updatedRes.nights;
                if (!totalBookingNights) {
                  totalBookingNights = Math.round((departure - arrival) / (1000 * 3600 * 24));
                }
                
                let totalBaseRate = 0;
                if (updatedRes.channelId === 2018) {
                  totalBaseRate = parseFloat(financeData.result.airbnbPayoutSum) || 0;
                } else {
                  totalBaseRate = parseFloat(financeData.result.baseRate) || 0;
                }
                
                // Calculate TODAY'S revenue only (per-night rate for current date)
                const perNightRate = totalBookingNights > 0 ? totalBaseRate / totalBookingNights : totalBaseRate;
                value = perNightRate; // Only today's single night revenue
              } else {
                value = parseFloat(financeData.result[field]) || 0;
              }
              if (updatedRes.channelId === 2018 || updatedRes.channelId === 2013) {
                value *= usdToPkr;
              }
              if (value > 0) {
                reservationBreakdown[field] = value;
                // Add revenue type classification
                reservationBreakdown.revenueType = hasCheckedIn ? 'actual' : 'expected';
              }
              reservationTotal += value;
              breakdown[field] = (breakdown[field] || 0) + value;
            });


            dailyRevenue += reservationTotal;
          }
        } catch (financeError) {
          // Silent error handling
        }
      }


      // Separate actual and expected revenue
      
      // Re-process reservations to separate actual vs expected
      for (const res of reservations) {
        let updatedRes = res;
        if (res.status === 'modified' || res.status === 'new') {
          try {
            const updatedResResponse = await errorHandler.makeApiCall(`https://api.hostaway.com/v1/reservations/${res.id}?includeResources=1` , {
              headers: {
                Authorization: authToken,
                'Content-Type': 'application/json'
              }
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
          // Check for check-in custom field with detailed logging
          const guestName = updatedRes.guestName || updatedRes.firstName || updatedRes.lastName || 
                           updatedRes.guest?.firstName || updatedRes.guest?.lastName || 
                           updatedRes.guestFirstName || updatedRes.guestLastName || 'Unknown Guest';
          console.log(`Checking guest: ${guestName}`);
          // Guest name resolved successfully
          
          // Get custom fields from the correct property: customFieldValues
          let customFields = [];
          
          if (updatedRes.customFieldValues && Array.isArray(updatedRes.customFieldValues)) {
            customFields = updatedRes.customFieldValues;
            console.log(`✅ Found ${customFields.length} custom fields in customFieldValues`);
          } else {
            console.log(`❌ No customFieldValues found in reservation`);
          }

          // Debug only Actual Check-in Time field
          console.log(`\n=== ACTUAL CHECK-IN TIME DEBUG ===`);
          const checkInField = customFields.find(fieldValue => 
            fieldValue.customFieldId === 76281 && 
            fieldValue.customField?.name === "Actual Check-in Time"
          );
          
          if (checkInField) {
            console.log(`✅ FOUND Actual Check-in Time:`);
            console.log(`  Custom Field ID: ${checkInField.customFieldId}`);
            console.log(`  Field Name: "${checkInField.customField?.name}"`);
            console.log(`  Check-in Time: "${checkInField.value}"`);
            console.log(`  Has Value: ${!!checkInField.value}`);
          } else {
            console.log(`❌ Actual Check-in Time field NOT FOUND`);
          }
          console.log(`=== END CHECK-IN DEBUG ===\n`);
          
          const hasCheckedIn = customFields && 
            customFields.some(fieldValue => {
              return fieldValue.customFieldId === 76281 && 
                fieldValue.customField?.name === "Actual Check-in Time" && 
                fieldValue.value && 
                fieldValue.value.trim() !== "";
            });
            
          console.log(`Guest ${guestName} has checked in: ${hasCheckedIn}` );


          try {
            const financeResponse = await errorHandler.makeFinanceCall(
              financeUrl + updatedRes.id,
              authToken,
              updatedRes.id
            );
            
            const financeData = financeResponse.data;
            if (financeData.status === 'success' && financeData.result) {
              let totalBookingNights = updatedRes.nights;
              if (!totalBookingNights) {
                totalBookingNights = Math.round((departure - arrival) / (1000 * 3600 * 24));
              }
              
              let totalBaseRate = 0;
              if (updatedRes.channelId === 2018) {
                totalBaseRate = parseFloat(financeData.result.airbnbPayoutSum) || 0;
              } else {
                totalBaseRate = parseFloat(financeData.result.baseRate) || 0;
              }
              
              const perNightRate = totalBookingNights > 0 ? totalBaseRate / totalBookingNights : totalBaseRate;
              let revenueValue = perNightRate;
              
              if (updatedRes.channelId === 2018 || updatedRes.channelId === 2013) {
                revenueValue *= usdToPkr;
              }
              
              // Classify revenue based on check-in status
              console.log(`Revenue classification for ${guestName}: ${revenueValue.toFixed(2)} PKR` );
              if (hasCheckedIn) {
                actualRevenue += revenueValue;
                console.log(`Added to ACTUAL revenue: ${revenueValue.toFixed(2)} PKR` );
              } else {
                expectedRevenue += revenueValue;
                console.log(`Added to EXPECTED revenue: ${revenueValue.toFixed(2)} PKR` );
              }
            }
          } catch (financeError) {
            // Silent error handling
          }
        }
      }
      
      totalRevenue = dailyRevenue; // Keep original total for compatibility


      // Show final revenue totals
      console.log(`\n=== REVENUE CLASSIFICATION RESULTS ===` );
      console.log(`💰 ACTUAL Revenue (guests checked in): ${actualRevenue.toFixed(2)} PKR` );
      console.log(`📅 EXPECTED Revenue (guests not checked in): ${expectedRevenue.toFixed(2)} PKR` );
      console.log(`💵 TOTAL Revenue: ${(actualRevenue + expectedRevenue).toFixed(2)} PKR` );
      console.log(`=======================================`);

      // Update properties in memory
      properties.totalRevenue = totalRevenue.toString();
    }

  } catch (reservationError) {
    console.error('❌ Error processing reservations:', reservationError);
    // Set default values in case of error
    actualRevenue = 0;
    expectedRevenue = 0;
    dailyRevenue = 0;
  }

      // Auto-post to Teable after revenue calculation
      try {
        const TeableService = require('./teableService');
        const teableService = new TeableService();
        
        // Format achieved value from total revenue
        const totalRev = parseFloat(totalRevenue) || 0;
        let achievedFormatted = "";
        
        if (totalRev >= 1000000) {
          achievedFormatted = `Rs${(totalRev / 1000000).toFixed(1)}M`;
        } else if (totalRev >= 1000) {
          achievedFormatted = `Rs${Math.round(totalRev / 1000)}K`;
        } else {
          achievedFormatted = `Rs${Math.round(totalRev)}`;
        }
        
        console.log('🚀 Auto-posting to Teable...');
        
        // Get Pakistan date and time for logging
        const now = new Date();
        const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
        
        // Format as DD/MM/YYYY, HH:MM:SS
        const day = pakistanTime.getUTCDate().toString().padStart(2, '0');
        const month = (pakistanTime.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = pakistanTime.getUTCFullYear();
        const hours = pakistanTime.getUTCHours().toString().padStart(2, '0');
        const minutes = pakistanTime.getUTCMinutes().toString().padStart(2, '0');
        const seconds = pakistanTime.getUTCSeconds().toString().padStart(2, '0');
        
        const pakistanDateTime = `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
        
        console.log('🇵🇰 Posting with Pakistan Date & Time:', pakistanDateTime);
        
        const postResult = await teableService.postTargetData({
          actual: "Rs583K", // Fixed value
          achieved: achievedFormatted // Dynamic value
        });
        
        if (postResult.success) {
          console.log('✅ Auto-posted to Teable successfully!');
          console.log(`📊 Posted: Actual=Rs583K, Achieved=${achievedFormatted}`);
        } else {
          console.log('⏰ Teable posting skipped:', postResult.error);
        }
      } catch (error) {
        console.log('❌ Auto-posting to Teable failed:', error.message);
      }

      return {
        actualRevenue: actualRevenue.toFixed(2),
        expectedRevenue: expectedRevenue.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        occupancyRate: occupancyRate,
        categoryAvailability: categoryAvailability
      };

  } catch (error) {
    console.error('❌ Error in main revenue processing:', error);
    return {
      actualRevenue: '0',
      expectedRevenue: '0', 
      totalRevenue: '0',
      occupancyRate: 0,
      categoryAvailability: {},
      error: 'API temporarily unavailable',
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = {
  getRevenueAndOccupancy
};