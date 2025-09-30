const axios = require('axios');
const https = require('https');
const http = require('http');

// Create HTTP agents with connection pooling
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000,
});

const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000,
});

// Create axios instance with connection pooling
const axiosInstance = axios.create({
  httpsAgent,
  httpAgent,
  timeout: 30000,
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 300; // Default
  },
  headers: {
    'User-Agent': 'Dashboard-App/1.0.0',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate',
  }
});

// Request interceptor for logging
axiosInstance.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
axiosInstance.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    
    // Log successful requests (optional, can be disabled in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
    }
    
    return response;
  },
  (error) => {
    const endTime = new Date();
    const duration = error.config?.metadata ? endTime - error.config.metadata.startTime : 0;
    
    // Log failed requests
    if (error.response) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response.status} (${duration}ms)`);
    } else if (error.request) {
      console.error(`🔌 ${error.config?.method?.toUpperCase()} ${error.config?.url} - Network Error (${duration}ms)`);
    } else {
      console.error(`⚠️ Request Error: ${error.message}`);
    }
    
    return Promise.reject(error);
  }
);

// Export cleanup function for manual cleanup
const cleanup = () => {
  httpsAgent.destroy();
  httpAgent.destroy();
};

// Export the cleanup function
axiosInstance.cleanup = cleanup;

module.exports = axiosInstance;
