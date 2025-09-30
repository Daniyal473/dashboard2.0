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
      revenueHealth: "/api/revenue/health"
    }
  });
});

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/revenue", revenueRoutes);

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

module.exports = app;
