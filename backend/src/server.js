// Load environment variables - Vercel handles this automatically in production
if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config({ path: "../.env" });
}
const app = require("./app");
const schedulerService = require("./services/schedulerService");
const { initializeMonthlyTargetScheduler } = require("./services/revenueService");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  // console.log(`✅ Backend running at http://localhost:${PORT}`);
  // console.log(`📡 API Documentation: http://localhost:${PORT}/`);
  // console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  // console.log(`💰 Revenue API: http://localhost:${PORT}/api/revenue`);
  // console.log(`🧪 Monthly Target Test: http://localhost:${PORT}/api/revenue/test-monthly-target`);
  // console.log(`\n💡 Press Ctrl+C to stop the server`);
  
  // Initialize monthly target scheduler
  // console.log('🚀 Initializing monthly target scheduler...');
  initializeMonthlyTargetScheduler();
});

// Graceful shutdown
let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  // console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
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