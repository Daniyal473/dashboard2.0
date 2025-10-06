// Serverless function to get monthly achieved revenue
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
    console.log('📊 Monthly Achieved Revenue API called');
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    const teableToken = 'teable_accSkoTP5GM9CQvPm4u_csIKhbkyBkfGhWK+6GsEqCbzRDpxu/kJJAorC0dxkhE=';
    const targetTableUrl = 'https://teable.namuve.com/api/table/tblnT8tc6g1kuN9bKld/record';
    
    console.log('📊 Calculating monthly achieved revenue...');
    
    const response = await fetch(targetTableUrl, {
      headers: {
        'Authorization': `Bearer ${teableToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Monthly target table API failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.records || data.records.length === 0) {
      console.log('⚠️ No records found in monthly target table');
      return res.status(200).json({
        success: true,
        data: {
          monthlyAchievedRevenue: 0,
          formattedMonthlyAchieved: 'Rs0',
          recordsCount: 0
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Get current month and year in Pakistan timezone
    const now = new Date();
    const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    const currentMonth = pakistanTime.getMonth();
    const currentYear = pakistanTime.getFullYear();
    
    console.log(`🗓️ Calculating for month: ${currentMonth + 1}/${currentYear}`);
    
    // Parse revenue value (Rs583K -> 583000)
    const parseRevenueValue = (value) => {
      if (!value || typeof value !== 'string') return 0;
      
      const cleanValue = value.replace(/Rs|,/g, '').trim();
      
      if (cleanValue.includes('M')) {
        return parseFloat(cleanValue.replace('M', '')) * 1000000;
      } else if (cleanValue.includes('K')) {
        return parseFloat(cleanValue.replace('K', '')) * 1000;
      } else {
        return parseFloat(cleanValue) || 0;
      }
    };
    
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
    
    // Filter records for current month
    const currentMonthRecords = data.records.filter(record => {
      if (!record.fields || !record.fields['Date']) return false;
      
      const recordDate = new Date(record.fields['Date']);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    console.log(`📋 Found ${currentMonthRecords.length} records for current month`);
    
    // Sum all achieved values for the month
    let monthlyTotal = 0;
    currentMonthRecords.forEach(record => {
      const achievedValue = record.fields['Achieved'] || '0';
      const numValue = parseRevenueValue(achievedValue);
      monthlyTotal += numValue;
      console.log(`➕ Adding daily revenue: ${achievedValue} (${numValue})`);
    });
    
    console.log(`✅ Monthly achieved total: ${formatRevenueValue(monthlyTotal)}`);
    
    return res.status(200).json({
      success: true,
      data: {
        monthlyAchievedRevenue: monthlyTotal,
        formattedMonthlyAchieved: formatRevenueValue(monthlyTotal),
        recordsCount: currentMonthRecords.length,
        currentMonth: currentMonth + 1,
        currentYear: currentYear
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Monthly achieved revenue error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to get monthly achieved revenue',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
