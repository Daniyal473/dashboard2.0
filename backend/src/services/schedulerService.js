const cron = require('node-cron');
const { getRevenueAndOccupancy } = require('./revenueService');
const TeableService = require('./teableService');

class SchedulerService {
  constructor() {
    this.teableService = new TeableService();
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
    this.cronJob = null;
  }

  /**
   * Start the hourly scheduler for posting data to Teable
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Scheduler is already running');
      return;
    }

    // Schedule to run every hour at minute 0 (e.g., 1:00, 2:00, 3:00, etc.)
    this.cronJob = cron.schedule('0 * * * *', async () => {
      await this.executeHourlyTask();
    }, {
      scheduled: true,
      timezone: "Asia/Karachi" // Pakistan timezone
    });

    this.isRunning = true;
    this.updateNextRunTime();
    
    console.log('🚀 Hourly Teable posting scheduler started');
    console.log(`⏰ Next run scheduled for: ${this.nextRun}`);

    // Also run immediately on startup (optional - remove if not needed)
    setTimeout(() => {
      this.executeHourlyTask();
    }, 5000); // Wait 5 seconds after startup
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;
    console.log('🛑 Hourly Teable posting scheduler stopped');
  }

  /**
   * Execute the hourly task of posting data to Teable
   */
  async executeHourlyTask() {
    try {
      console.log('\n🔄 Starting hourly Teable data posting...');
      this.lastRun = new Date().toISOString();

      // Get current revenue data
      console.log('📊 Fetching revenue data...');
      const revenueData = await getRevenueAndOccupancy();

      if (!revenueData) {
        throw new Error('No revenue data received');
      }

      // Format data for Teable
      const formattedData = this.teableService.formatRevenueDataForTeable(revenueData);
      
      console.log('💰 Revenue Data Summary:');
      console.log(`  - Actual Revenue: ${formattedData.actual}`);
      console.log(`  - Achieved Revenue: ${formattedData.achieved}`);

      // Post to Teable
      const result = await this.teableService.postTargetData(formattedData);

      if (result.success) {
        console.log('✅ Successfully posted hourly data to Teable');
        console.log(`📅 Posted at: ${result.timestamp}`);
      } else {
        console.error('❌ Failed to post data to Teable:', result.error);
      }

      this.updateNextRunTime();
      console.log(`⏰ Next run scheduled for: ${this.nextRun}\n`);

      return result;

    } catch (error) {
      console.error('❌ Error in hourly task execution:', error.message);
      this.updateNextRunTime();
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update the next run time for display purposes
   */
  updateNextRunTime() {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Next hour at minute 0
    this.nextRun = nextHour.toISOString();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      currentTime: new Date().toISOString()
    };
  }

  /**
   * Test the Teable connection
   */
  async testTeableConnection() {
    return await this.teableService.testConnection();
  }

  /**
   * Manual trigger for testing (posts data immediately)
   */
  async triggerManualPost() {
    console.log('🔧 Manual trigger initiated...');
    return await this.executeHourlyTask();
  }
}

// Create singleton instance
const schedulerService = new SchedulerService();

module.exports = schedulerService;
