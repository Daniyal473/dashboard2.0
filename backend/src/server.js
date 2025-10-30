// Clean server startup

// Load environment variables - Vercel handles this automatically in production
if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config({ path: "../.env" });
}

const app = require("./app");
const schedulerService = require("./services/schedulerService");
const { initializeMonthlyTargetScheduler } = require("./services/revenueService");
const { RevenueTableService } = require("../services/RevenueTable");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  // Silent server startup
  
  // Initialize monthly target scheduler
  initializeMonthlyTargetScheduler();
  
  // Initialize RevenueTable automatic updates
  const revenueTableService = new RevenueTableService();
  revenueTableService.startAutomaticUpdates(20); // Every 20 minutes
});

// Add error handling for server startup
server.on('error', (error) => {
  // Silent error handling
});

// Silent server setup

// Graceful shutdown
let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  // Silent shutdown
  
  // Stop scheduler first
  schedulerService.stop();
  // console.log('✅ Scheduler stopped');
  
  // Close server
  server.close(() => {
    // console.log('✅ HTTP server closed');
    
    // console.log('✅ HTTP connections closed');
    
    // console.log('✅ Server shutdown complete');
    process.exit(0);
  });
  
  // Force close after 5 seconds
  setTimeout(() => {
    // console.log('⚠️ Forcing server shutdown...');
    process.exit(1);
  }, 5000);
};

// Remove all existing listeners first
process.removeAllListeners('SIGTERM');
process.removeAllListeners('SIGINT');

// Add our handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));