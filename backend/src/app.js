// SUPPRESS ALL CONSOLE LOGS GLOBALLY
console.log = () => {};
console.error = () => {};
console.warn = () => {};
console.info = () => {};
console.debug = () => {};

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const config = require("./config/config");

const app = express();

// Environment-based CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`🔍 CORS check for origin: "${origin}"`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Development Origins
    const developmentOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000',
      'http://localhost:5173', // Vite dev server
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5000', 
      'http://127.0.0.1:5173', // Vite dev server
      /^http:\/\/localhost:\d+\/?$/, // Allow any localhost port with optional trailing slash
      /^http:\/\/127\.0\.0\.1:\d+\/?$/ // Allow any 127.0.0.1 port with optional trailing slash
    ];
    
    // Production Origins
    const productionOrigins = [
      'http://128.199.0.150',
      'http://128.199.0.150:3000',
      'http://128.199.0.150/authentication/sign-in',
      'https://tested-1pln9mbk8-rana-talhas-projects.vercel.app',
      'https://tested-murex.vercel.app',
      'https://portal.namuve.com',
      /\.vercel\.app$/, // Allow all Vercel domains
    ];
    
    // Choose origins based on environment
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? productionOrigins 
      : [...developmentOrigins, ...productionOrigins]; // Dev includes both for testing
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        // Check exact match and also match without trailing slash
        const originWithoutSlash = origin.replace(/\/$/, '');
        const allowedWithoutSlash = allowedOrigin.replace(/\/$/, '');
        const match = allowedOrigin === origin || allowedWithoutSlash === originWithoutSlash;
        if (match) console.log(`✅ CORS: Matched string origin "${allowedOrigin}" for "${origin}"`);
        return match;
      }
      if (allowedOrigin instanceof RegExp) {
        const match = allowedOrigin.test(origin);
        if (match) console.log(`✅ CORS: Matched regex pattern "${allowedOrigin}" for origin "${origin}"`);
        return match;
      }
      return false;
    });
    
    if (isAllowed) {
      console.log(`✅ CORS: Origin "${origin}" is allowed in ${process.env.NODE_ENV || 'development'} mode`);
      callback(null, true);
    } else {
      console.log(`❌ CORS: Origin "${origin}" is NOT allowed in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`❌ Available origins:`, allowedOrigins.filter(o => typeof o === 'string'));
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};

// Enable compression for all responses
app.use(compression({
  level: 6, // Compression level (0-9, 6 is good balance)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if the request includes a cache-control: no-transform directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    // Use compression for all other responses
    return compression.filter(req, res);
  }
}));

// Use CORS with options, but also add a fallback for development
app.use(cors(corsOptions));

// Additional CORS headers for development
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`🔍 Additional CORS middleware - Origin: "${origin}"`);
  
  // Allow all localhost origins in development
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    console.log(`✅ Additional CORS: Allowing localhost origin "${origin}"`);
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ Handling OPTIONS preflight request for ${req.path}`);
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Import routes
const userRoutes = require("./routes/userRoutes");
const revenueRoutes = require("./routes/revenueRoutes");
const teableRoutes = require("./routes/teableRoutes");
const authRoutes = require("./routes/authRoutes");
const occupancyRoutes = require("./routes/occupancyRoutes");
const roomRoutes = require("../api/Room");
const paymentRoutes = require("../api/payment");
const monthlyTargetHandler = require("../api/monthly-target");

// Import RevenueTable integration
const { RevenueTableService } = require("../services/RevenueTable");

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
      auth: "/api/auth",
      rooms: "/api/rooms",
      occupancy: "/api/occupancy",
      revenueTable: "/api/revenue-table",
      revenueTableData: "/api/revenue-table/revenue-data",
      revenueTableFastDashboard: "/api/revenue-table/fast-dashboard-data",
      revenueTablePopulate: "/api/revenue-table/populate-initial",
      listingRevenue: "/api/listing-revenue",
      listingRevenueData: "/api/listing-revenue/listing-revenue-data",
      listingRevenuePopulate: "/api/listing-revenue/populate-listing-initial"
    }
  });
});

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/teable", teableRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/occupancy", occupancyRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/payment", paymentRoutes);

// RevenueTable API routes
app.use("/api/revenue-table", RevenueTableService.createAPIRoutes());

// Listing Revenue API routes (same routes, different path)
app.use("/api/listing-revenue", RevenueTableService.createAPIRoutes());

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
