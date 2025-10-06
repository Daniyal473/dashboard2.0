// Serverless function for daily target tracking
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
    console.log('📊 Daily Target API called');
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    const teableToken = 'teable_accSkoTP5GM9CQvPm4u_csIKhbkyBkfGhWK+6GsEqCbzRDpxu/kJJAorC0dxkhE=';
    const dailyTargetTableUrl = 'https://teable.namuve.com/api/table/tblq9gnsTEbz2IqQQLK/record'; // Daily target specific table
    
    // Step 1: Get today's revenue from the main revenue API
    console.log('📊 Fetching today\'s revenue from main revenue API...');
    
    const revenueApiUrl = `${req.headers.host ? `https://${req.headers.host}` : 'https://backend-6b2t7jbrn-rana-talhas-projects.vercel.app'}/api/revenue`;
    
    const revenueResponse = await fetch(revenueApiUrl);
    
    if (!revenueResponse.ok) {
      throw new Error(`Revenue API failed: ${revenueResponse.status}`);
    }
    
    const revenueData = await revenueResponse.json();
    
    if (!revenueData.success || !revenueData.data) {
      throw new Error('Invalid revenue data received');
    }
    
    // Get actual and expected revenue from API for daily achievement
    const actualRevenue = parseFloat(revenueData.data.actualRevenue) || 0; // Rs196K
    const expectedRevenue = parseFloat(revenueData.data.expectedRevenue) || 0; // Rs219K
    const dailyAchieved = actualRevenue + expectedRevenue; // Rs196K + Rs219K = Rs415K
    const dailyTarget = 583000; // Fixed daily target Rs583K
    
    console.log(`✅ Daily Target: ${dailyTarget.toFixed(2)} PKR`);
    console.log(`✅ Daily Achieved: ${dailyAchieved.toFixed(2)} PKR (${actualRevenue.toFixed(2)} + ${expectedRevenue.toFixed(2)})`);
    
    // Get today's date in Pakistan timezone
    const now = new Date();
    const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    
    // Format revenue value (583000 -> Rs583K)
    const formatRevenueValue = (value) => {
      const numValue = parseFloat(value) || 0;
      
      if (numValue >= 1000000) {
        return `Rs${(numValue / 1000000).toFixed(1)}M`;
      } else if (numValue >= 1000) {
        return `Rs${Math.round(numValue / 1000)}K`;
      } else {
        return `Rs${Math.round(numValue)}`;
      }
    };
    
    if (dailyAchieved < 0) {
      return res.status(400).json({
        success: false,
        error: 'No revenue data available',
        timestamp: new Date().toISOString()
      });
    }
    
    // Step 2: Post to daily target table
    console.log(`🚀 Posting daily target data - Target: Rs583K, Achieved: ${formatRevenueValue(dailyAchieved)}`);
    console.log(`📊 Breakdown: Actual Revenue: ${formatRevenueValue(actualRevenue)}, Expected Revenue: ${formatRevenueValue(expectedRevenue)}`);
    
    const postData = {
      records: [{
        fields: {
          'Date and Time ': pakistanTime.toISOString(),
          'Daily Target Actual': formatRevenueValue(dailyTarget), // Rs583K (daily target) - shows in "Actual" column
          'Daily Target Achieved': formatRevenueValue(dailyAchieved) // Rs420K (sum of actual + expected) - shows in "Achieved" column
        }
      }]
    };
    
    const targetResponse = await fetch(dailyTargetTableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teableToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    if (!targetResponse.ok) {
      const errorText = await targetResponse.text();
      throw new Error(`Daily target table API failed: ${targetResponse.status} - ${errorText}`);
    }
    
    console.log('✅ Successfully posted daily target data to table');
    
    return res.status(200).json({
      success: true,
      message: 'Daily target post successful',
      data: {
        dailyTarget: dailyTarget,
        dailyAchieved: dailyAchieved,
        actualRevenue: actualRevenue,
        expectedRevenue: expectedRevenue,
        formattedDailyTarget: formatRevenueValue(dailyTarget),
        formattedDailyAchieved: formatRevenueValue(dailyAchieved),
        formattedActualRevenue: formatRevenueValue(actualRevenue),
        formattedExpectedRevenue: formatRevenueValue(expectedRevenue),
        dailyProgress: ((dailyAchieved / dailyTarget) * 100).toFixed(1),
        postedAt: pakistanTime.toISOString()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Daily target post failed:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Daily target post failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
