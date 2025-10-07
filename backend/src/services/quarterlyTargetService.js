const axios = require('axios');
const config = require('../config/config');

class QuarterlyTargetService {
  constructor() {
    this.targetTableUrl = 'https://teable.namuve.com/api/table/tblnT8tc6g1kuN9bKld/record';
    this.teableToken = 'teable_accSkoTP5GM9CQvPm4u_csIKhbkyBkfGhWK+6GsEqCbzRDpxu/kJJAorC0dxkhE=';
    this.quarterlyTargetActual = '70M'; // Hardcoded quarterly target
  }

  /**
   * Get quarterly achieved revenue by summing all daily records for current quarter (4 months)
   */
  async getQuarterlyAchievedRevenue() {
    try {
      console.log('📊 Calculating quarterly achieved revenue...');
      
      const response = await axios.get(this.targetTableUrl, {
        headers: {
          'Authorization': `Bearer ${this.teableToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (!response.data || !response.data.records) {
        console.log('⚠️ No records found in monthly target table for quarterly calculation');
        return 0;
      }

      console.log(`📋 Total records in Teable for quarterly calculation: ${response.data.records.length}`);

      // Get current date in Pakistan timezone
      const now = new Date();
      const pakistanTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
      const currentMonth = pakistanTime.getMonth(); // 0-11
      const currentYear = pakistanTime.getFullYear();
      const today = pakistanTime.getDate();

      // Determine current quarter and start date
      let quarterStartMonth, quarterEndMonth, quarterName;
      if (currentMonth >= 0 && currentMonth <= 3) { // Jan-Apr (Q1)
        quarterStartMonth = 0; // January
        quarterEndMonth = 3;   // April
        quarterName = 'Q1';
      } else if (currentMonth >= 4 && currentMonth <= 7) { // May-Aug (Q2)
        quarterStartMonth = 4; // May
        quarterEndMonth = 7;   // August
        quarterName = 'Q2';
      } else { // Sep-Dec (Q3)
        quarterStartMonth = 8; // September
        quarterEndMonth = 11;  // December
        quarterName = 'Q3';
      }

      console.log(`🗓️ Current quarter: ${quarterName} (${quarterStartMonth + 1}/${currentYear} to ${quarterEndMonth + 1}/${currentYear})`);
      console.log(`📅 Today's date: ${today}/${currentMonth + 1}/${currentYear}`);
      console.log(`🔍 Looking for records from ${quarterStartMonth + 1}/1/${currentYear} to ${currentMonth + 1}/${today}/${currentYear}`);

      // Filter records for current quarter up to today only
      const quarterRecords = response.data.records.filter(record => {
        if (!record.fields || !record.fields['Date and Time ']) return false;
        
        const dateTimeStr = record.fields['Date and Time '];
        const recordDate = new Date(dateTimeStr);
        const recordMonth = recordDate.getMonth();
        const recordYear = recordDate.getFullYear();
        const recordDay = recordDate.getDate();
        
        console.log(`📅 Record date: ${dateTimeStr} → day=${recordDay}, month=${recordMonth + 1}, year=${recordYear}`);
        
        // Check if record is in current year and current quarter
        const isCurrentYear = recordYear === currentYear;
        const isInQuarter = recordMonth >= quarterStartMonth && recordMonth <= quarterEndMonth;
        
        // For current month, only include up to today
        // For past months in quarter, include all days
        let isUpToToday = true;
        if (recordMonth === currentMonth) {
          isUpToToday = recordDay <= today;
        }
        
        const shouldInclude = isCurrentYear && isInQuarter && isUpToToday;
        
        if (shouldInclude) {
          console.log(`✅ Including record from ${recordDay}/${recordMonth + 1}/${recordYear} (within quarter range)`);
        } else if (isCurrentYear && isInQuarter && !isUpToToday) {
          console.log(`❌ Excluding record from ${recordDay}/${recordMonth + 1}/${recordYear} (future date in current month)`);
        } else {
          console.log(`❌ Excluding record from ${recordDay}/${recordMonth + 1}/${recordYear} (outside quarter range)`);
        }
        
        return shouldInclude;
      });

      console.log(`📋 Found ${quarterRecords.length} records from quarter start to today`);

      // Sum all achieved values from quarter start to today
      let quarterlyTotal = 0;
      quarterRecords.forEach(record => {
        const achievedValue = record.fields['Monthly Target Achieved'] || '0';
        const numValue = this.parseRevenueValue(achievedValue);
        quarterlyTotal += numValue;
        
        const recordDate = new Date(record.fields['Date and Time ']);
        const recordDay = recordDate.getDate();
        const recordMonth = recordDate.getMonth();
        console.log(`➕ Adding ${recordDay}/${recordMonth + 1} revenue: ${achievedValue} (${numValue})`);
      });

      console.log(`✅ Quarterly achieved total (${quarterName}): ${this.formatRevenueValue(quarterlyTotal)}`);
      return quarterlyTotal;

    } catch (error) {
      console.error('❌ Error calculating quarterly achieved revenue:', error.message);
      return 0;
    }
  }

  /**
   * Parse revenue value (Rs583K -> 583000)
   */
  parseRevenueValue(value) {
    if (!value || typeof value !== 'string') return 0;
    
    const cleanValue = value.replace(/Rs|,/g, '').trim();
    
    if (cleanValue.includes('M')) {
      return parseFloat(cleanValue.replace('M', '')) * 1000000;
    } else if (cleanValue.includes('K')) {
      return parseFloat(cleanValue.replace('K', '')) * 1000;
    } else {
      return parseFloat(cleanValue) || 0;
    }
  }

  /**
   * Format revenue value (583000 -> Rs583K)
   */
  formatRevenueValue(value) {
    const numValue = parseFloat(value) || 0;
    
    if (numValue >= 1000000) {
      return `Rs${(numValue / 1000000).toFixed(1)}M`;
    } else if (numValue >= 1000) {
      return `Rs${(numValue / 1000).toFixed(0)}K`;
    } else {
      return `Rs${numValue.toFixed(0)}`;
    }
  }

  /**
   * Get quarterly target actual (hardcoded)
   */
  getQuarterlyTargetActual() {
    return this.quarterlyTargetActual;
  }
}

module.exports = QuarterlyTargetService;
