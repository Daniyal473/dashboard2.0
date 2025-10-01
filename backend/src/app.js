const express = require("express");
const cors = require("cors");
const config = require("./config/config");

const app = express();

// CORS configuration
const corsOptions = {
  origin: config.CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Import routes
const userRoutes = require("./routes/userRoutes");
const revenueRoutes = require("./routes/revenueRoutes");
const teableRoutes = require("./routes/teableRoutes");

// Import and start scheduler
const schedulerService = require("./services/schedulerService");

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Dashboard Backend API is running! 🚀",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    endpoints: {
      health: "/api/health",
      hello: "/api/hello",
      users: "/api/users",
      revenue: "/api/revenue",
      revenueHealth: "/api/revenue/health",
      teable: "/api/teable",
      teableStatus: "/api/teable/status"
    }
  });
});

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/teable", teableRoutes);

// Simple test route
app.get("/api/hello", (req, res) => {
  res.json({ 
    message: "Hello from Backend 🚀",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Dashboard Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start the scheduler automatically when the app is loaded
setTimeout(() => {
  console.log('🚀 Starting Teable hourly scheduler automatically...');
  schedulerService.start();
}, 2000); // Wait 2 seconds after app initialization

module.exports = app;
