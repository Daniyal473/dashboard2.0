/**
 * Room.js - Hostaway Listings API
 * Fetches listing data from Hostaway API
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
 * Update cleaning status in Teable API
 */
async function updateCleaningStatusInTeable(listingId, newStatus) {
  try {
    console.log(`🔄 updateCleaningStatusInTeable called with listingId: "${listingId}", newStatus: "${newStatus}"`);
    
    // Validate inputs
    if (!listingId) {
      throw new Error('Listing ID is required for Teable update');
    }
    
    if (!newStatus) {
      throw new Error('New status is required for Teable update');
    }
    
    // First, fetch all records to find the one with matching listing ID
    const teableUrl = 'https://teable.namuve.com/api/table/tblg8UqsmbyTMeZV1j8/record';
    console.log(`🔗 Fetching from Teable URL: ${teableUrl}`);
    
    const fetchResponse = await fetch(teableUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer teable_accSkoTP5GM9CQvPm4u_csIKhbkyBkfGhWK+6GsEqCbzRDpxu/kJJAorC0dxkhE=',
        'User-Agent': 'Dashboard-App/1.0'
      }
    });

    console.log(`📡 Fetch response status: ${fetchResponse.status} ${fetchResponse.statusText}`);

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      throw new Error(`Failed to fetch records: ${fetchResponse.status} ${fetchResponse.statusText} - ${errorText}`);
    }

    const data = await fetchResponse.json();
    console.log(`📋 Fetched ${data.records?.length || 0} records from Teable`);
    
    let recordToUpdate = null;

    // Find the record with matching listing ID
    if (data.records && Array.isArray(data.records)) {
      console.log(`🔍 Searching for listing ID "${listingId}" in ${data.records.length} records`);
      
      recordToUpdate = data.records.find(record => {
        const recordListingId = String(record.fields['Listing IDs']);
        console.log(`🔍 Comparing "${recordListingId}" === "${String(listingId)}"`);
        return recordListingId === String(listingId);
      });
      
      if (recordToUpdate) {
        console.log(`✅ Found matching record:`, {
          id: recordToUpdate.id,
          listingId: recordToUpdate.fields['Listing IDs'],
          currentStatus: recordToUpdate.fields['HW - Status']
        });
      } else {
        console.log(`❌ No matching record found. Available listing IDs:`, 
          data.records.map(r => r.fields['Listing IDs']).filter(Boolean)
        );
      }
    } else {
      console.log(`❌ No records array found in response:`, data);
    }

    if (!recordToUpdate) {
      throw new Error(`No record found for listing ID ${listingId}. Available IDs: ${data.records?.map(r => r.fields['Listing IDs']).filter(Boolean).join(', ') || 'none'}`);
    }

    // Convert our status to Teable format
    const teableStatus = newStatus === 'Clean' ? 'Cleaned ✅' : 'Not Cleaned';
    console.log(`🔄 Converting "${newStatus}" to Teable format: "${teableStatus}"`);
    console.log(`🔄 Will update both HW - Status and HK - Status fields`);
    
    // Update the record
    const updateUrl = `${teableUrl}/${recordToUpdate.id}`;
    console.log(`🔄 Updating record at: ${updateUrl}`);
    
    const updatePayload = {
      record: {
        fields: {
          'HW - Status': teableStatus,
          'HK - Status': teableStatus
        }
      }
    };
    console.log(`📤 Update payload:`, updatePayload);
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer teable_accSkoTP5GM9CQvPm4u_csIKhbkyBkfGhWK+6GsEqCbzRDpxu/kJJAorC0dxkhE=',
        'User-Agent': 'Dashboard-App/1.0'
      },
      body: JSON.stringify(updatePayload)
    });

    console.log(`📡 Update response status: ${updateResponse.status} ${updateResponse.statusText}`);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`❌ Update failed with response:`, errorText);
      throw new Error(`Failed to update record: ${updateResponse.status} ${updateResponse.statusText} - ${errorText}`);
    }

    const updatedRecord = await updateResponse.json();
    console.log(`✅ Successfully updated Teable record for listing ${listingId}`);
    console.log(`✅ Both HW - Status and HK - Status set to: "${teableStatus}"`);
    console.log(`📋 Updated record:`, updatedRecord);
    
    return {
      success: true,
      recordId: recordToUpdate.id,
      listingId: listingId,
      oldHwStatus: recordToUpdate.fields['HW - Status'],
      oldHkStatus: recordToUpdate.fields['HK - Status'],
      newStatus: teableStatus,
      fieldsUpdated: ['HW - Status', 'HK - Status'],
      updatedRecord: updatedRecord
    };

  } catch (error) {
    console.error(`❌ Error in updateCleaningStatusInTeable for listing ${listingId}:`, error.message);
    console.error(`❌ Full error:`, error);
    console.error(`❌ Error stack:`, error.stack);
    
    // Re-throw with more context
    const contextualError = new Error(`Failed to update cleaning status in Teable for listing ${listingId}: ${error.message}`);
    contextualError.originalError = error;
    throw contextualError;
  }
}

/**
 * Fetch cleaning status from Teable API
 */
async function fetchCleaningStatusFromTeable() {
  try {
    console.log('🔄 Attempting to fetch from Teable API...');
    const teableUrl = 'https://teable.namuve.com/api/table/tblg8UqsmbyTMeZV1j8/record';
    console.log('🔗 Teable URL:', teableUrl);
    
    const response = await fetch(teableUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer teable_accSkoTP5GM9CQvPm4u_csIKhbkyBkfGhWK+6GsEqCbzRDpxu/kJJAorC0dxkhE=',
        'User-Agent': 'Dashboard-App/1.0'
      }
    });

    console.log('📡 Teable API Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.error('❌ Teable API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error response body:', errorText);
      return {};
    }

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Teable API returned non-JSON response:', contentType);
      const textResponse = await response.text();
      console.error('❌ Response body:', textResponse);
      return {};
    }

    const data = await response.json();
    console.log('📡 Teable API Response:', JSON.stringify(data, null, 2));
    const cleaningStatusMap = {};

    // Map Teable records to cleaning status by Listing IDs
    if (data.records && Array.isArray(data.records)) {
      console.log('📋 Processing', data.records.length, 'Teable records');
      data.records.forEach((record, index) => {
        const fields = record.fields;
        console.log(`🔍 Record ${index + 1}:`, {
          'Listing IDs': fields['Listing IDs'],
          'HW - Status': fields['HW - Status'],
          'HK - Status': fields['HK - Status'],
          'Listing Name': fields['Listing Name'],
          'Activity': fields['Activity'],
          '(T) Reservation ID': fields['(T) Reservation ID'],
          '(T) Check-In Date': fields['(T) Check-In Date'],
          '(T) Check-out Date': fields['(T) Check-out Date'],
          '(T) Reservation Status': fields['(T) Reservation Status'],
          '(T) Guest Name': fields['(T) Guest Name'],
          'Reservation Status': fields['Reservation Status'],
          'Status': fields['Status'],
          'Booking Status': fields['Booking Status']
        });
        
        if (fields['Listing IDs'] && (fields['HW - Status'] || fields['HK - Status'])) {
          const listingId = String(fields['Listing IDs']); // Convert to string for consistent mapping
          const hwStatus = fields['HW - Status'] || fields['HK - Status'];
          const activity = fields['Activity'] || 'Unknown';
          const reservationId = fields['(T) Reservation ID'] || '';
          const checkInDate = fields['(T) Check-In Date'] || '';
          const checkOutDate = fields['(T) Check-out Date'] || '';
          const guestName = fields['(T) Guest Name'] || '';
          // Get the actual reservation status from Teable
          const reservationStatus = fields['(T) Reservation Status'] || fields['Reservation Status'] || fields['Status'] || fields['Booking Status'] || '';
          
          console.log(`🔍 Processing Listing ${listingId}:`);
          console.log(`   - HW Status: "${fields['HW - Status']}"`);
          console.log(`   - HK Status: "${fields['HK - Status']}"`);
          console.log(`   - Activity: "${activity}"`);
          console.log(`   - Reservation ID: "${reservationId}"`);
          console.log(`   - Check-In Date: "${checkInDate}"`);
          console.log(`   - Check-out Date: "${checkOutDate}"`);
          console.log(`   - Guest Name: "${guestName}"`);
          console.log(`   - Reservation Status: "${reservationStatus}"`);
          console.log(`   - Selected Status: "${hwStatus}"`);
          
          // Convert Teable status to our format
          let cleanStatus = 'Not Clean';
          if (hwStatus && hwStatus.includes('Cleaned ✅')) {
            cleanStatus = 'Clean';
          }
          
          console.log(`✅ Mapped Listing ${listingId}: "${hwStatus}" → "${cleanStatus}"`);
          cleaningStatusMap[listingId] = {
            cleaningStatus: cleanStatus,
            activity: activity,
            reservationId: reservationId,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            guestName: guestName,
            reservationStatus: reservationStatus
          };
        } else {
          console.log(`⚠️ Record ${index + 1} missing required fields`);
        }
      });
    }

    console.log('✅ Fetched cleaning status from Teable:', Object.keys(cleaningStatusMap).length, 'records');
    console.log('🧹 Cleaning status map:', cleaningStatusMap);
    return cleaningStatusMap;
  } catch (error) {
    console.error('❌ Error fetching cleaning status from Teable:', error.message);
    console.error('❌ Full error:', error);
    
    // Return empty map to see if Teable API is actually working
    console.log('🔄 Teable API failed - returning empty status map');
    return {};
  }
}

/**
 * Fetch all listings from Hostaway
 */
async function fetchHostawayListings(listingId = null) {
  try {
    // Fetch cleaning status from Teable first
    console.log('🧹 Fetching cleaning status from Teable...');
    const cleaningStatusMap = await fetchCleaningStatusFromTeable();
    console.log('🧹 Received cleaning status map:', cleaningStatusMap);
    
    const url = listingId 
      ? `https://api.hostaway.com/v1/listings/${listingId}`
      : 'https://api.hostaway.com/v1/listings';
      
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `${process.env.HOSTAWAY_AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        'Cache-control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Hostaway API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle both single listing and multiple listings responses
    let listings = [];
    

    // Helper function to get full listing name
    const getFullListingName = (listing) => {
      // Debug: Log available name fields
      console.log(`🏠 Listing ${listing.id} name fields:`, {
        name: listing.name,
        internalListingName: listing.internalListingName
      });

      // Priority 1: Use internalListingName if available
      if (listing.internalListingName && listing.internalListingName.trim() !== '') {
        console.log(`✅ Using internalListingName for ${listing.id}: ${listing.internalListingName}`);
        return listing.internalListingName;
      }
      
      // Priority 2: Use name field
      if (listing.name && listing.name.trim() !== '') {
        console.log(`✅ Using name for ${listing.id}: ${listing.name}`);
        return listing.name;
      }
      
      // Fallback
      console.log(`⚠️ Using fallback for ${listing.id}`);
      return 'Unnamed Listing';
    };

    if (listingId) {
      // Single listing response
      if (data.result) {
        const listing = data.result;
        listings = [{
          id: listing.id,
          name: getFullListingName(listing),
          address: listing.address || 'Address not available',
          city: listing.city || '',
          country: listing.country || '',
          location: listing.location || '',
          bedrooms: listing.bedrooms || 0,
          bathrooms: listing.bathrooms || 0,
          maxGuests: listing.personCapacity || 0,
          status: listing.status || 'active',
          cleaningStatus: (() => {
            const teableData = cleaningStatusMap[String(listing.id)];
            const status = teableData?.cleaningStatus || 'Not Clean';
            console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): cleaning status = "${status}"`);
            return status;
          })(),
          activity: (() => {
            const teableData = cleaningStatusMap[String(listing.id)];
            const activity = teableData?.activity || 'Unknown';
            console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): activity = "${activity}"`);
            return activity;
          })(),
          reservationId: (() => {
            const teableData = cleaningStatusMap[String(listing.id)];
            const reservationId = teableData?.reservationId || '';
            console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): reservationId = "${reservationId}"`);
            return reservationId;
          })(),
          checkInDate: (() => {
            const teableData = cleaningStatusMap[String(listing.id)];
            const checkInDate = teableData?.checkInDate || '';
            console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): checkInDate = "${checkInDate}"`);
            return checkInDate;
          })(),
          checkOutDate: (() => {
            const teableData = cleaningStatusMap[String(listing.id)];
            const checkOutDate = teableData?.checkOutDate || '';
            console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): checkOutDate = "${checkOutDate}"`);
            return checkOutDate;
          })(),
          reservationStatus: (() => {
            const teableData = cleaningStatusMap[String(listing.id)];
            const reservationStatus = teableData?.reservationStatus || '';
            console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): reservationStatus = "${reservationStatus}"`);
            return reservationStatus;
          })(),
          guestName: (() => {
            const teableData = cleaningStatusMap[String(listing.id)];
            const guestName = teableData?.guestName || '';
            console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): guestName = "${guestName}"`);
            return guestName;
          })()
        }];
      }
    } else {
      // Multiple listings response
      listings = data.result?.map(listing => ({
        id: listing.id,
        name: getFullListingName(listing),
        address: listing.address || 'Address not available',
        city: listing.city || '',
        country: listing.country || '',
        location: listing.location || '',
        bedrooms: listing.bedroomsNumber || 0,
        bathrooms: listing.bathroomsNumber || 0,
        maxGuests: listing.personCapacity || 0,
        status: listing.status || 'active',
        cleaningStatus: (() => {
          const teableData = cleaningStatusMap[String(listing.id)];
          const status = teableData?.cleaningStatus || 'Not Clean';
          console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): cleaning status = "${status}"`);
          return status;
        })(),
        activity: (() => {
          const teableData = cleaningStatusMap[String(listing.id)];
          const activity = teableData?.activity || 'Unknown';
          console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): activity = "${activity}"`);
          return activity;
        })(),
        reservationId: (() => {
          const teableData = cleaningStatusMap[String(listing.id)];
          const reservationId = teableData?.reservationId || '';
          console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): reservationId = "${reservationId}"`);
          return reservationId;
        })(),
        checkInDate: (() => {
          const teableData = cleaningStatusMap[String(listing.id)];
          const checkInDate = teableData?.checkInDate || '';
          console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): checkInDate = "${checkInDate}"`);
          return checkInDate;
        })(),
        checkOutDate: (() => {
          const teableData = cleaningStatusMap[String(listing.id)];
          const checkOutDate = teableData?.checkOutDate || '';
          console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): checkOutDate = "${checkOutDate}"`);
          return checkOutDate;
        })(),
        reservationStatus: (() => {
          const teableData = cleaningStatusMap[String(listing.id)];
          const reservationStatus = teableData?.reservationStatus || '';
          console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): reservationStatus = "${reservationStatus}"`);
          return reservationStatus;
        })(),
        guestName: (() => {
          const teableData = cleaningStatusMap[String(listing.id)];
          const guestName = teableData?.guestName || '';
          console.log(`🏠 Listing ${listing.id} (${listing.internalListingName}): guestName = "${guestName}"`);
          return guestName;
        })()
      })) || [];
    }

    return {
      success: true,
      count: listings.length,
      listings: listings
    };

  } catch (error) {
    console.error('❌ Error fetching Hostaway listings:', error.message);
    return {
      success: false,
      error: error.message,
      listings: []
    };
  }
}

/**
 * GET /api/rooms/listings
 * Endpoint to get all listings
 */
router.get('/listings', async (req, res) => {
  try {
    console.log('🏠 Fetching Hostaway listings...');
    
    const result = await fetchHostawayListings();
    
    if (result.success) {
      console.log(`✅ Successfully fetched ${result.count} listings`);
      res.json({
        success: true,
        message: `Found ${result.count} listings`,
        data: result.listings
      });
    } else {
      console.log('❌ Failed to fetch listings:', result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch listings from Hostaway',
        error: result.error,
        data: []
      });
    }
    
  } catch (error) {
    console.error('❌ Room listings endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      data: []
    });
  }
});

/**
 * GET /api/rooms/listings/:id
 * Endpoint to get a specific listing by ID
 */
router.get('/listings/:id', async (req, res) => {
  try {
    const listingId = req.params.id;
    console.log(`🏠 Fetching listing details for ID: ${listingId}`);
    
    const result = await fetchHostawayListings(listingId);
    
    if (result.success) {
      if (result.listings.length > 0) {
        const listing = result.listings[0];
        console.log(`✅ Found listing: ${listing.name}`);
        res.json({
          success: true,
          message: 'Listing found',
          data: listing
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Listing not found',
          data: null
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch listing from Hostaway',
        error: result.error,
        data: null
      });
    }
    
  } catch (error) {
    console.error('❌ Room listing detail endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      data: null
    });
  }
});

/**
 * PUT /api/rooms/cleaning-status/:id
 * Update cleaning status in Teable API
 */
router.put('/cleaning-status/:id', async (req, res) => {
  try {
    const listingId = req.params.id;
    const { cleaningStatus: newStatus } = req.body;
    
    console.log(`🔄 PUT /cleaning-status/${listingId} - Request body:`, req.body);
    console.log(`🔄 Extracted newStatus: "${newStatus}"`);
    
    // Validate input parameters
    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID is required'
      });
    }
    
    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: 'Cleaning status is required in request body'
      });
    }
    
    // Validate status
    if (!['Clean', 'Not Clean'].includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid cleaning status "${newStatus}". Must be "Clean" or "Not Clean"`
      });
    }
    
    console.log(`🔄 Updating cleaning status for listing ${listingId} to "${newStatus}"`);
    
    // Update the status in Teable
    const updateResult = await updateCleaningStatusInTeable(listingId, newStatus);
    
    console.log(`✅ Successfully updated cleaning status for listing ${listingId}`, updateResult);
    
    res.json({
      success: true,
      message: `Cleaning status updated successfully to "${newStatus}"`,
      data: {
        listingId: listingId,
        cleaningStatus: newStatus,
        teableUpdate: updateResult
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating cleaning status:', error);
    console.error('❌ Error stack:', error.stack);
    
    const errorMessage = error.message || 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      message: `Failed to update cleaning status: ${errorMessage}`,
      error: errorMessage,
      debug: {
        listingId: req.params.id,
        requestBody: req.body,
        errorType: error.constructor.name
      }
    });
  }
});

/**
 * GET /api/rooms/cleaning-status
 * Get all cleaning statuses from Teable
 */
router.get('/cleaning-status', async (req, res) => {
  try {
    const cleaningStatusMap = await fetchCleaningStatusFromTeable();
    
    res.json({
      success: true,
      message: 'Cleaning statuses retrieved from Teable successfully',
      data: cleaningStatusMap
    });
  } catch (error) {
    console.error('❌ Error fetching cleaning statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      data: {}
    });
  }
});

/**
 * GET /api/rooms/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Room API is healthy',
    timestamp: new Date().toISOString(),
    token_configured: !!process.env.HOSTAWAY_AUTH_TOKEN,
    fetch_available: typeof fetch !== 'undefined',
    node_version: process.version
  });
});

/**
 * GET /api/rooms/test-teable
 * Test Teable API connectivity
 */
router.get('/test-teable', async (req, res) => {
  try {
    console.log('🧪 Testing Teable API connectivity...');
    const cleaningStatusMap = await fetchCleaningStatusFromTeable();
    
    res.json({
      success: true,
      message: 'Teable API test successful',
      recordCount: Object.keys(cleaningStatusMap).length,
      sampleData: Object.keys(cleaningStatusMap).slice(0, 3).reduce((obj, key) => {
        obj[key] = cleaningStatusMap[key];
        return obj;
      }, {}),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Teable API test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Teable API test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
