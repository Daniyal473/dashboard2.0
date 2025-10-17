/**
 * payment.js - Hostaway Reservations API
 * Fetches reservation data from Hostaway API for today's new/modified reservations
 */

const express = require('express');
const router = express.Router();

// Ensure fetch is available (Node.js 18+ has it built-in, older versions need polyfill)
let fetch;
try {
  // Try to use built-in fetch (Node.js 18+)
  fetch = globalThis.fetch;
  if (!fetch) {
    // Fallback to node-fetch for older Node.js versions
    fetch = require('node-fetch');
  }
} catch (error) {
  console.error('❌ Fetch not available. Installing node-fetch...');
  try {
    fetch = require('node-fetch');
  } catch (fetchError) {
    console.error('❌ node-fetch not installed. Please run: npm install node-fetch');
    throw new Error('Fetch API not available. Please install node-fetch or upgrade to Node.js 18+');
  }
}

/**
 * Get today's date in Pakistan timezone (YYYY-MM-DD format)
 */
function getTodayDate() {
  // Get Pakistan date and time
  const now = new Date();
  const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
  
  // Format as YYYY-MM-DD
  const year = pakistanTime.getUTCFullYear();
  const month = (pakistanTime.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = pakistanTime.getUTCDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Fetch reservations from Hostaway API
 */
async function fetchTodayReservations() {
  try {
    console.log('🔄 Fetching today\'s reservations from Hostaway API...');
    
    const today = getTodayDate();
    console.log(`📅 Today's date: ${today}`);
    
    // Hostaway API endpoint for reservations (same as revenue.js)
    const url = 'https://api.hostaway.com/v1/reservations?includeResources=1';
    console.log(`🔗 API URL: ${url}`);
    
    // Debug authentication token
    const authToken = process.env.HOSTAWAY_AUTH_TOKEN;
    console.log(`🔑 Token exists: ${!!authToken}`);
    console.log(`🔑 Token length: ${authToken ? authToken.length : 0}`);
    console.log(`🔑 Token preview: ${authToken ? authToken.substring(0, 10) + '...' : 'NOT_SET'}`);
    
    if (!authToken) {
      throw new Error('HOSTAWAY_AUTH_TOKEN environment variable is not set');
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json',
        'Cache-control': 'no-cache'
      }
    });
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`Hostaway API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`📦 Received ${data.result?.length || 0} total reservations`);
    
    // Get ALL reservations for today
    const allReservations = data.result || [];
    console.log(`📋 Processing ${allReservations.length} reservations for today`);
    
    // First, get Pakistani listings to filter reservations
    console.log('🇵🇰 Fetching Pakistani listings for filtering...');
    let pakistaniListingIds = [];
    
    try {
      const listingsResponse = await fetch('https://api.hostaway.com/v1/listings?limit=200', {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json();
        if (listingsData?.result) {
          // Filter Pakistani listings exactly like revenue.js
          const pakistaniListings = listingsData.result.filter(listing => 
            listing.country === 'Pakistan' && listing.id && listing.name
          );
          
          pakistaniListingIds = pakistaniListings.map(listing => Number(listing.id));
          console.log(`🇵🇰 Found ${pakistaniListingIds.length} Pakistani listings: [${pakistaniListingIds.join(', ')}]`);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching Pakistani listings:', error.message);
    }
    
    console.log(`🔍 Processing reservations for today: ${today}`);
    
    // Filter reservations exactly like revenue.js
    const filteredReservations = allReservations.filter(res => {
      // Check dates
      if (!res.arrivalDate || !res.departureDate) return false;
      
      // Check status - ONLY 'new' or 'modified' reservations
      if (!['new', 'modified'].includes(res.status)) return false;
      
      // Check if listing is in allowed Pakistani listings (use listingMapId like revenue.js)
      if (pakistaniListingIds.length > 0 && !pakistaniListingIds.includes(Number(res.listingMapId))) {
        return false;
      }
      
      // ONLY show reservations that have today's date (2025-10-17) in check-in or check-out
      const arrivalDate = res.arrivalDate;
      const departureDate = res.departureDate;
      
      // Show reservation ONLY if today matches check-in OR check-out date
      const isTodaysReservation = 
        arrivalDate === today ||           // Check-in today
        departureDate === today;           // Check-out today
      
      if (!isTodaysReservation) return false;
      
      // Check for test guests (same as revenue.js)
      const guestName = res.guestName || res.firstName || res.lastName || '';
      const isTestGuest = !guestName || /test|testing|guests|new guest/i.test(guestName);
      if (isTestGuest) return false;
      
      return true;
    });
    
    console.log(`✅ Filtered to ${filteredReservations.length} valid reservations`);
    
    // Transform data for frontend
    const transformedReservations = filteredReservations.map(reservation => {
      // Determine payment status
      let paymentStatus = 'Pending';
      if (reservation.isPaid || reservation.paymentStatus === 'paid') {
        paymentStatus = 'Paid';
      } else if (reservation.paymentStatus) {
        paymentStatus = reservation.paymentStatus;
      }
      
      // Get actual check-in time from custom field (same as revenue.js)
      let actualCheckInTime = 'N/A';
      if (reservation.customFieldValues && Array.isArray(reservation.customFieldValues)) {
        const checkInField = reservation.customFieldValues.find(field => 
          field.customFieldId === 76281 && 
          field.customField?.name === "Actual Check-in Time" &&
          field.value && 
          field.value.trim() !== ""
        );
        if (checkInField) {
          actualCheckInTime = checkInField.value.trim();
        }
      }
      
      return {
        id: reservation.id,
        reservationId: reservation.id,
        guestName: reservation.guestName || 'N/A',
        listingName: reservation.listingMapName || reservation.listingName || 'N/A',
        checkInDate: reservation.arrivalDate || 'N/A',
        checkOutDate: reservation.departureDate || 'N/A',
        actualCheckInTime: actualCheckInTime,
        baseRate: reservation.totalPrice || 0,
        paymentStatus: paymentStatus,
        status: reservation.status,
        currency: reservation.currency || 'USD',
        nights: reservation.nights || 0,
        guests: reservation.guestsCount || 0,
        listingId: reservation.listingMapId
      };
    });
    
    console.log(`✅ Processed ${transformedReservations.length} reservations with payment status`);
    
    return {
      success: true,
      data: transformedReservations,
      total: transformedReservations.length,
      date: today
    };
    
  } catch (error) {
    console.error('❌ Error fetching reservations:', error);
    throw error;
  }
}

/**
 * GET /api/payment/today-reservations
 * Get today's new/modified reservations
 */
router.get('/today-reservations', async (req, res) => {
  try {
    console.log('🔄 API call: GET /api/payment/today-reservations');
    
    const result = await fetchTodayReservations();
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error in /today-reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s reservations',
      error: error.message
    });
  }
});

/**
 * GET /api/payment/reservation/:id
 * Get specific reservation details
 */
router.get('/reservation/:id', async (req, res) => {
  try {
    const reservationId = req.params.id;
    console.log(`🔄 API call: GET /api/payment/reservation/${reservationId}`);
    
    const authToken = process.env.HOSTAWAY_AUTH_TOKEN;
    const url = `https://api.hostaway.com/v1/reservations/${reservationId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json',
        'Cache-control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Hostaway API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    res.json({
      success: true,
      data: data.result
    });
    
  } catch (error) {
    console.error(`❌ Error fetching reservation ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservation details',
      error: error.message
    });
  }
});

/**
 * GET /api/payment/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  const token = process.env.HOSTAWAY_AUTH_TOKEN;
  res.json({
    success: true,
    message: 'Payment API is healthy',
    timestamp: new Date().toISOString(),
    token_configured: !!token,
    token_length: token ? token.length : 0,
    token_preview: token ? token.substring(0, 10) + '...' : 'NOT_SET'
  });
});

module.exports = router;
