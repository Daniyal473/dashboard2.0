// Fixed serverless function that matches local server exactly
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    console.log('📊 Revenue API endpoint called');
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    // Check environment variables
    const authToken = process.env.HOSTAWAY_AUTH_TOKEN;
    if (!authToken) {
      return res.status(500).json({
        success: false,
        error: 'HOSTAWAY_AUTH_TOKEN not configured',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('🔑 Auth token available:', !!authToken);
    
    // Step 1: Get Pakistani listings (same as local server)
    console.log('🏠 Fetching Pakistani listings...');
    let allowedListingIds = [];
    
    try {
      const listingsResponse = await fetch('https://api.hostaway.com/v1/listings', {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json();
        if (listingsData?.result) {
          // Filter Pakistani listings exactly like local server
          const pakistaniListings = listingsData.result.filter(listing => 
            listing.country === 'Pakistan' && listing.id && listing.name
          );
          
          allowedListingIds = pakistaniListings.map(listing => Number(listing.id));
          console.log(`📊 Found ${allowedListingIds.length} Pakistani listings: [${allowedListingIds.join(', ')}]`);
        }
      }
    } catch (listingsError) {
      console.log('⚠️ Failed to fetch listings');
    }
    
    // Step 2: Get reservations
    console.log('📄 Fetching reservations...');
    const reservationsResponse = await fetch('https://api.hostaway.com/v1/reservations?includeResources=1', {
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (!reservationsResponse.ok) {
      throw new Error(`Reservations API failed: ${reservationsResponse.status}`);
    }
    
    const reservationsData = await reservationsResponse.json();
    const allReservations = reservationsData.result || [];
    
    // Step 3: Get current Pakistan date (same as local server)
    const now = new Date();
    const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    const today = pakistanTime.toISOString().split('T')[0];
    
    console.log(`🔍 Processing reservations for today: ${today}`);
    
    // Step 4: Filter reservations exactly like local server
    const filteredReservations = allReservations.filter(res => {
      // Check dates
      if (!res.arrivalDate || !res.departureDate) return false;
      
      // Check status
      if (!['new', 'modified'].includes(res.status)) return false;
      
      // Check if listing is in allowed Pakistani listings
      if (allowedListingIds.length > 0 && !allowedListingIds.includes(Number(res.listingMapId))) {
        return false;
      }
      
      // Check date range (today is within stay period)
      const arrival = new Date(res.arrivalDate);
      const departure = new Date(res.departureDate);
      const todayDate = new Date(today);
      
      if (!(todayDate >= arrival && todayDate < departure)) return false;
      
      // Check for test guests
      const guestName = res.guestName || res.firstName || res.lastName || '';
      const isTestGuest = !guestName || /test|testing|guests|new guest/i.test(guestName);
      if (isTestGuest) return false;
      
      return true;
    });
    
    console.log(`✅ Filtered to ${filteredReservations.length} valid reservations`);
    
    // Step 5: Calculate revenue exactly like local server
    let actualRevenue = 583000; // Hardcoded to Rs583K as requested
    let apiActualRevenue = 0; // Will store API actual revenue
    let apiExpectedRevenue = 0; // Will store API expected revenue
    let processedCount = 0;
    
    // Get USD to PKR rate
    const usdToPkr = 279;
    
    for (const reservation of filteredReservations) {
      try {
        console.log(`🔍 Processing reservation ${reservation.id} - Guest: ${reservation.guestName}`);
        
        // Check if guest has checked in (custom field ID 76281)
        let hasCheckedIn = false;
        if (reservation.customFieldValues && Array.isArray(reservation.customFieldValues)) {
          const checkInField = reservation.customFieldValues.find(field => 
            field.customFieldId === 76281 && 
            field.customField?.name === "Actual Check-in Time" &&
            field.value && 
            field.value.trim() !== ""
          );
          hasCheckedIn = !!checkInField;
        }
        
        console.log(`Guest ${reservation.guestName} checked in: ${hasCheckedIn}`);
        
        // Get finance data for accurate revenue
        const financeResponse = await fetch(`https://api.hostaway.com/v1/financeStandardField/reservation/${reservation.id}`, {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        });
        
        let revenueAmount = 0;
        
        if (financeResponse.ok) {
          const financeData = await financeResponse.json();
          
          if (financeData.status === 'success' && financeData.result) {
            // Calculate nights
            const arrival = new Date(reservation.arrivalDate);
            const departure = new Date(reservation.departureDate);
            let totalNights = reservation.nights || Math.round((departure - arrival) / (1000 * 3600 * 24));
            
            // Get base rate based on channel
            let totalBaseRate = 0;
            if (reservation.channelId === 2018) {
              totalBaseRate = parseFloat(financeData.result.airbnbPayoutSum) || 0;
            } else {
              totalBaseRate = parseFloat(financeData.result.baseRate) || 0;
            }
            
            // Calculate per-night rate
            const perNightRate = totalNights > 0 ? totalBaseRate / totalNights : totalBaseRate;
            revenueAmount = perNightRate;
            
            // Apply currency conversion for USD channels
            if (reservation.channelId === 2018 || reservation.channelId === 2013) {
              revenueAmount *= usdToPkr;
              console.log(`💱 Applied USD to PKR: ${perNightRate.toFixed(2)} USD × ${usdToPkr} = ${revenueAmount.toFixed(2)} PKR`);
            }
          }
        } else {
          console.log(`⚠️ Finance API failed for reservation ${reservation.id}`);
          // Fallback calculation
          const totalPrice = parseFloat(reservation.totalPrice) || 0;
          const arrival = new Date(reservation.arrivalDate);
          const departure = new Date(reservation.departureDate);
          const totalNights = Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24));
          revenueAmount = totalNights > 0 ? totalPrice / totalNights : totalPrice;
        }
        
        // Collect API revenue values for sum calculation
        if (hasCheckedIn) {
          apiActualRevenue += revenueAmount;
          console.log(`✅ API ACTUAL: ${revenueAmount.toFixed(2)} PKR`);
        } else {
          apiExpectedRevenue += revenueAmount;
          console.log(`⏳ API EXPECTED: ${revenueAmount.toFixed(2)} PKR`);
        }
        
        processedCount++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (reservationError) {
        console.log(`❌ Error processing reservation ${reservation.id}:`, reservationError.message);
      }
    }
    
    // Calculate expected revenue as sum of both API values (as requested)
    const expectedRevenue = apiActualRevenue + apiExpectedRevenue;
    // For posting: use hardcoded actual (583K) + expected (261K)
    const totalRevenue = 583000 + expectedRevenue;
    
    console.log(`\n=== FINAL RESULTS ===`);
    console.log(`💰 ACTUAL Revenue: ${actualRevenue.toFixed(2)} PKR (hardcoded)`);
    console.log(`📊 API Actual: ${apiActualRevenue.toFixed(2)} PKR`);
    console.log(`📊 API Expected: ${apiExpectedRevenue.toFixed(2)} PKR`);
    console.log(`📅 EXPECTED Revenue: ${expectedRevenue.toFixed(2)} PKR (sum of API values)`);
    console.log(`💵 TOTAL Revenue: ${totalRevenue.toFixed(2)} PKR (583K + ${Math.round(expectedRevenue/1000)}K)`);
    console.log(`✅ Processed: ${processedCount} reservations`);
    
    // Auto-post to Teable after revenue calculation
    try {
      console.log('🚀 Auto-posting to Teable...');
      
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
      
      // Post to Teable API
      const teableResponse = await fetch(process.env.TEABLE_BASE_URL || 'https://teable.namuve.com/api/table/tblq9gnsTEbz2IqQQLK/record', {
        method: 'POST',
        headers: {
          'Authorization': process.env.TEABLE_BEARER_TOKEN || 'teable_accSkoTP5GM9CQvPm4u_csIKhbkyBkfGhWK+6GsEqCbzRDpxu/kJJAorC0dxkhE=',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actual: "Rs583K", // Fixed value as requested
          achieved: achievedFormatted // Dynamic sum of actualRevenue + expectedRevenue
        })
      });
      
      if (teableResponse.ok) {
        console.log('✅ Auto-posted to Teable successfully!');
        console.log(`📊 Posted: Actual=Rs583K, Achieved=${achievedFormatted}`);
      } else {
        console.log('⏰ Teable posting failed:', teableResponse.status);
      }
    } catch (error) {
      console.log('❌ Auto-posting to Teable failed:', error.message);
    }
    
    // Get monthly achieved revenue
    let monthlyAchievedRevenue = 0;
    try {
      const monthlyResponse = await fetch(`${req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000'}/api/monthly-achieved`);
      if (monthlyResponse.ok) {
        const monthlyData = await monthlyResponse.json();
        if (monthlyData.success) {
          monthlyAchievedRevenue = monthlyData.data.monthlyAchievedRevenue || 0;
          console.log(`📊 Monthly achieved revenue: ${monthlyAchievedRevenue.toFixed(2)} PKR`);
        }
      }
    } catch (error) {
      console.log('❌ Error getting monthly achieved revenue:', error.message);
    }
    
    // Format values
    const formatRevenue = (amount) => {
      if (amount >= 1000000) {
        return `Rs${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `Rs${Math.round(amount / 1000)}K`;
      } else {
        return `Rs${Math.round(amount)}`;
      }
    };
    
    return res.status(200).json({
      success: true,
      data: {
        actualRevenue: apiActualRevenue.toFixed(2), // API Actual Revenue (dynamic)
        expectedRevenue: apiExpectedRevenue.toFixed(2), // API Expected Revenue (dynamic)
        totalRevenue: (apiActualRevenue + apiExpectedRevenue).toFixed(2), // Combined total (dynamic)
        monthlyAchievedRevenue: monthlyAchievedRevenue.toFixed(2), // Monthly achieved revenue
        formattedActualRevenue: formatRevenue(apiActualRevenue),
        formattedExpectedRevenue: formatRevenue(apiExpectedRevenue),
        formattedTotalRevenue: formatRevenue(apiActualRevenue + apiExpectedRevenue),
        formattedMonthlyAchieved: formatRevenue(monthlyAchievedRevenue),
        occupancyRate: 85,
        processedReservations: processedCount,
        totalReservations: allReservations.length,
        allowedListings: allowedListingIds.length,
        todayDate: today
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Revenue API error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
