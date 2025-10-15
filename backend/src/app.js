const express = require("express");
const cors = require("cors");
const config = require("./config/config");

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://128.199.0.150',
      'http://128.199.0.150:3000',
      'https://tested-1pln9mbk8-rana-talhas-projects.vercel.app',
      'https://tested-murex.vercel.app',
      'https://portal.namuve.com',
      /\.vercel\.app$/ // Allow all Vercel domains
    ];
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
const authRoutes = require("./routes/authRoutes");
const monthlyTargetHandler = require("../api/monthly-target");

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
      teableStatus: "/api/teable/status",
      monthlyTarget: "/api/monthly-target",
      auth: "/api/auth"
    }
  });
});

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/teable", teableRoutes);
app.use("/api/auth", authRoutes);

// Monthly target route
app.all("/api/monthly-target", monthlyTargetHandler);

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
