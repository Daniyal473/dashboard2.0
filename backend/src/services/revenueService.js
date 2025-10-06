const fs = require('fs').promises;
const config = require('../config/config');
const axios = require('axios');
const MonthlyTargetService = require('./monthlyTargetService');

// Dynamic listings data - will be fetched from API
let LISTINGS_DATA = {};

// Simple in-memory lock to prevent concurrent API calls
let isProcessing = false;
let lastProcessTime = 0;
const PROCESS_COOLDOWN = 30000; // 30 seconds cooldown between requests

/**
 * Fetch listings from Hostaway API and categorize them
 * @returns {Promise<Object>} Categorized listings data
 */
async function fetchListingsData() {
  const authToken = config.HOSTAWAY_AUTH_TOKEN;
  
  try {
    console.log('🏠 Fetching listings from Hostaway API...');
    console.log('🔑 Using auth token:', authToken ? 'Token present' : 'No token');
    
    const response = await axios.get('https://api.hostaway.com/v1/listings', {
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (!response.data || !response.data.result) {
      throw new Error('Invalid response from listings API');
    }

    const listings = response.data.result;
    const categorizedListings = {};
    let totalPakistaniCount = 0;
    let categorizedCount = 0;

    console.log(`📊 Total listings received from API: ${listings.length}`);

    // Debug: Show all listings first
    console.log('🔍 DEBUG: All listings from API:');
    listings.forEach((listing, index) => {
      console.log(`   ${index + 1}. ID=${listing.id}, Name="${listing.name}", Country="${listing.country || 'Unknown'}"`);
    });

    // Process each listing and categorize by name/title
    listings.forEach(listing => {
      if (!listing.id || !listing.name) {
        console.log(`⚠️ Skipping listing with missing ID or name: ID=${listing.id}, Name="${listing.name}"`);
        return;
      }

      // Filter only Pakistani listings
      if (listing.country !== 'Pakistan') {
        console.log(`⏭️ Skipping non-Pakistani listing: ${listing.name} (Country: ${listing.country || 'Unknown'})`);
        return;
      }

      totalPakistaniCount++;
      console.log(`🇵🇰 Pakistani listing #${totalPakistaniCount}: ID=${listing.id}, Name="${listing.name}"`);

      const listingName = listing.name.toLowerCase();
      let category = null; // No default category

      // Categorize based on listing name patterns - Include ALL Pakistani listings
      if (listingName.includes('studio')) {
        category = 'Studio';
      } else if (listingName.includes('1br') || listingName.includes('1 br') || listingName.includes('1 bedroom')) {
        category = '1BR';
      } else if (listingName.includes('2br premium') || listingName.includes('2 br premium')) {
        category = '2BR Premium';
      } else if (listingName.includes('2br') || listingName.includes('2 br') || listingName.includes('2 bedroom')) {
        category = '2BR';
      } else if (listingName.includes('3br') || listingName.includes('3 br') || listingName.includes('3 bedroom')) {
        category = '3BR';
      } else {
        // Enhanced pattern matching for listings that don't match basic patterns
        if (listingName.includes('2bhk') || listingName.includes('2 bhk')) {
          category = '2BR';
        } else if (listingName.includes('1bhk') || listingName.includes('1 bhk')) {
          category = '1BR';
        } else if (listingName.includes('3bhk') || listingName.includes('3 bhk')) {
          category = '3BR';
        } else if (listingName.includes('premium') && (listingName.includes('2') || listingName.includes('two'))) {
          category = '2BR Premium';
        } else if (listingName.includes('mini') && listingName.includes('studio')) {
          category = 'Studio';
        } else if (listingName.includes('bedroom')) {
          // Extract number from bedroom mentions
          if (listingName.includes('1') || listingName.includes('one')) {
            category = '1BR';
          } else if (listingName.includes('2') || listingName.includes('two')) {
            category = '2BR';
          } else if (listingName.includes('3') || listingName.includes('three')) {
            category = '3BR';
          } else {
            category = '1BR'; // Default fallback
          }
        } else {
          category = '1BR'; // Default fallback for truly unknown listings
          console.log(`❓ Unknown listing assigned to 1BR: ID=${listing.id}, Name="${listing.name}"`);
        }
        
        console.log(`🔍 Enhanced pattern match for ID ${listing.id}: "${listing.name}" → ${category}`);
      }

      categorizedCount++;
      // Initialize category array if it doesn't exist
      if (!categorizedListings[category]) {
        categorizedListings[category] = [];
      }

      // Add listing ID to the appropriate category
      categorizedListings[category].push(listing.id);
      
      // Log the listing details
      console.log(`✅ Categorized as ${category}: ID=${listing.id}, Name="${listing.name}"`);
    });

    console.log('✅ Pakistani listings categorized successfully:');
    Object.keys(categorizedListings).forEach(category => {
      const listingIds = categorizedListings[category];
      console.log(`   ${category}: ${listingIds.length} listings - IDs: [${listingIds.join(', ')}]`);
    });

    const totalPakistaniListings = Object.values(categorizedListings).flat().length;
    console.log(`\n📊 SUMMARY:`);
    console.log(`🇵🇰 Total Pakistani listings found: ${totalPakistaniCount}`);
    console.log(`✅ Successfully categorized: ${categorizedCount}`);
    console.log(`❌ Uncategorized (excluded): ${totalPakistaniCount - categorizedCount}`);

    return categorizedListings;

  } catch (error) {
    console.error('❌ Error fetching listings:', error.message);
    
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📊 Response data:', error.response.data);
      
      if (error.response.status === 403) {
        console.error('🔒 Authorization failed - check your HOSTAWAY_AUTH_TOKEN');
        console.error('💡 Make sure the token has permission to access listings');
      }
    }
    
    // No fallback - return empty data if API fails
    console.log('❌ API failed - returning empty listings data (no hardcoded fallback)');
    return {};
  }
}

/**
 * Refresh listings data (no cache)
 * @returns {Promise<Object>} Fresh listings data
 */
async function refreshListingsCache() {
  console.log('🔄 Refreshing listings data...');
  const freshListings = await fetchListingsData();
  LISTINGS_DATA = freshListings;
  
  return freshListings;
}

async function getRevenueAndOccupancy() {
  const authToken = config.HOSTAWAY_AUTH_TOKEN;

  // Always fetch fresh listings data dynamically - NO HARDCODED DATA
  console.log('🔄 Fetching fresh listings data from API (no hardcode)');
  LISTINGS_DATA = await fetchListingsData();
  
  if (!LISTINGS_DATA || Object.keys(LISTINGS_DATA).length === 0) {
    console.log('❌ No listings data available - cannot proceed');
    throw new Error('No listings data available from API');
  }

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
  let actualRevenue = 583000; // Hardcoded to Rs583K as requested
  let apiActualRevenue = 0; // Track API actual revenue separately
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
    const calendarUrl = `https://api.hostaway.com/v1/listings/${listingId}/calendar?startDate=${today}&endDate=${today}`;
    
    let calendarData;
    try {
      const response = await axios.get(calendarUrl, {
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      calendarData = response.data;
      
    } catch (error) {
      // Create default data structure for failed requests
      calendarData = { result: [{ status: 'available' }] };
    }
    
    // Process the calendar data
    let status = 'available';
    if (calendarData?.result?.length > 0) {
      status = calendarData.result[0].status;
    }
    
    return { listingId, category, status };
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


  // API endpoints - include resources in the response (single request)
  const baseReservationsUrl = 'https://api.hostaway.com/v1/reservations?includeResources=1';
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
    const exchangeResponse = await axios.get(exchangeRateUrl, { timeout: 30000 });
    const exchangeData = exchangeResponse.data;
    if (exchangeData.conversion_rates && exchangeData.conversion_rates.PKR) {
      usdToPkr = exchangeData.conversion_rates.PKR;
    }
  } catch (error) {
    // Silent fallback to default rate
  }


  // Simple circuit breaker state
  const circuitBreaker = {
    failures: 0,
    maxFailures: 5,
    timeout: 5 * 60 * 1000, // 5 minutes
    nextAttempt: Date.now(),
    isOpen: false
  };

  // Check if circuit breaker is open
  const isCircuitOpen = () => {
    if (circuitBreaker.isOpen && Date.now() < circuitBreaker.nextAttempt) {
      return true;
    }
    if (circuitBreaker.isOpen && Date.now() >= circuitBreaker.nextAttempt) {
      console.log('🔄 Circuit breaker attempting to close...');
      circuitBreaker.isOpen = false;
      circuitBreaker.failures = 0;
    }
    return false;
  };

  // Record success/failure for circuit breaker
  const recordResult = (success) => {
    if (success) {
      circuitBreaker.failures = 0;
      circuitBreaker.isOpen = false;
    } else {
      circuitBreaker.failures++;
      if (circuitBreaker.failures >= circuitBreaker.maxFailures) {
        circuitBreaker.isOpen = true;
        circuitBreaker.nextAttempt = Date.now() + circuitBreaker.timeout;
        console.log(`🚫 Circuit breaker opened due to ${circuitBreaker.failures} failures. Next attempt in ${circuitBreaker.timeout/1000/60} minutes.`);
      }
    }
  };

  // Retry function with exponential backoff
  const retryRequest = async (url, config, maxRetries = 3) => {
    // Check circuit breaker
    if (isCircuitOpen()) {
      throw new Error('Circuit breaker is open - API calls temporarily disabled');
    }
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 API attempt ${attempt}/${maxRetries} for reservations...`);
        const response = await axios.get(url, config);
        console.log(`✅ API call successful on attempt ${attempt}`);
        recordResult(true); // Record success
        return response;
      } catch (error) {
        console.log(`❌ API attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          recordResult(false); // Record failure after all retries
          throw error;
        }
        
        // Exponential backoff: wait 2^attempt seconds
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  };

  try {
    console.log('📄 Fetching reservations (single request)...');
    const response = await retryRequest(baseReservationsUrl, {
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json'
      },
      timeout: 60000 // Increased to 60 seconds
    });
    
    const allReservations = response.data.result || [];
    const breakdown = {};

    if (allReservations && allReservations.length > 0) {
      // Filter reservations to include only those with status "new" or "modified" and where today is within the stay period
      let filteredOut = { noDate: 0, wrongStatus: 0, wrongListing: 0, outsideStay: 0, testGuest: 0 };
      
      const reservations = allReservations.filter(res => {
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
              updatedResResponse = await axios.get(`https://api.hostaway.com/v1/reservations/${res.id}?include=customFields,listing,guest,messages,payments`, {
                headers: {
                  Authorization: authToken,
                  'Content-Type': 'application/json'
                },
                timeout: 30000
              });
              console.log(`✅ Got reservation details with include parameters`);
            } catch (includeError) {
              console.log(`❌ Include parameters failed, trying basic endpoint`);
              
              // Fallback: Basic reservation endpoint
              updatedResResponse = await axios.get(`https://api.hostaway.com/v1/reservations/${res.id}`, {
                headers: {
                  Authorization: authToken,
                  'Content-Type': 'application/json'
                },
                timeout: 30000
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
          const financeResponse = await axios.get(financeUrl + updatedRes.id, {
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json'
            },
            timeout: 45000
          });
          
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
            const updatedResResponse = await axios.get(`https://api.hostaway.com/v1/reservations/${res.id}?includeResources=1`, {
              headers: {
                Authorization: authToken,
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
            const financeResponse = await axios.get(financeUrl + updatedRes.id, {
              headers: {
                Authorization: authToken,
                'Content-Type': 'application/json'
              },
              timeout: 45000
            });
            
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
                apiActualRevenue += revenueValue;
                console.log(`Added to API ACTUAL revenue: ${revenueValue.toFixed(2)} PKR` );
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


      // Calculate achieved revenue (API actual + expected)
      const achievedRevenue = apiActualRevenue + expectedRevenue;
      
      // Show final revenue totals
      console.log(`\n=== REVENUE CLASSIFICATION RESULTS ===` );
      console.log(`📊 API Actual Revenue: ${apiActualRevenue.toFixed(2)} PKR` );
      console.log(`📅 Expected Revenue: ${expectedRevenue.toFixed(2)} PKR` );
      console.log(`✅ TOTAL Revenue: ${(apiActualRevenue + expectedRevenue).toFixed(2)} PKR` );
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

      // Calculate achieved revenue (API actual + expected)
      const achievedRevenue = apiActualRevenue + expectedRevenue;
      
      // Get monthly achieved revenue
      let monthlyAchievedRevenue = 0;
      try {
        const monthlyTargetService = new MonthlyTargetService();
        monthlyAchievedRevenue = await monthlyTargetService.getMonthlyAchievedRevenue();
        console.log(`📊 Monthly achieved revenue: ${monthlyAchievedRevenue.toFixed(2)} PKR`);
      } catch (error) {
        console.error('❌ Error getting monthly achieved revenue:', error.message);
      }
      
      return {
        actualRevenue: apiActualRevenue.toFixed(2), // API Actual Revenue (dynamic)
        expectedRevenue: expectedRevenue.toFixed(2), // Expected Revenue (dynamic)
        totalRevenue: (apiActualRevenue + expectedRevenue).toFixed(2), // Combined total (dynamic)
        monthlyAchievedRevenue: monthlyAchievedRevenue.toFixed(2), // Monthly achieved revenue
        occupancyRate: occupancyRate,
        categoryAvailability: categoryAvailability
      };

  } catch (error) {
    console.error('❌ Error in main revenue processing:', error);
    return {
      actualRevenue: '0', // API Actual Revenue (error fallback)
      expectedRevenue: '0', // Expected Revenue (error fallback)
      totalRevenue: '0', // Combined total (error fallback)
      monthlyAchievedRevenue: '0', // Monthly achieved revenue (error fallback)
      occupancyRate: 0,
      categoryAvailability: {},
      error: 'API temporarily unavailable',
      lastUpdated: new Date().toISOString()
    };
  }
}

// Initialize monthly target service and scheduler
const monthlyTargetService = new MonthlyTargetService();

// Test function for 2pm posting
async function testMonthlyTargetPost() {
  return await monthlyTargetService.testPost2pm();
}

// Initialize scheduler
function initializeMonthlyTargetScheduler() {
  monthlyTargetService.scheduleDailyPosting();
}

module.exports = {
  getRevenueAndOccupancy,
  refreshListingsCache,
  fetchListingsData,
  testMonthlyTargetPost,
  initializeMonthlyTargetScheduler
};
