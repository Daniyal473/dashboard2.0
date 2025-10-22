// API Configuration
const getApiBaseUrl = () => {
  // Check if we're in development or production
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5000";
  }

  // In production, use specific backend URL
  return "https://portal.namuve.com/api";
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  VERIFY_ADMIN: `${API_BASE_URL}/auth/admin/verify`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  VERIFY_TOKEN: `${API_BASE_URL}/auth/verify-token`,
  AUTH_HEALTH: `${API_BASE_URL}/auth/health`,

  // User endpoints
  USERS: `${API_BASE_URL}/auth/admin/users`,
  CREATE_USER: `${API_BASE_URL}/auth/admin/create-user`,
  UPDATE_USER_ROLE: `${API_BASE_URL}/auth/admin/update-role`,
  UPDATE_USERNAME: `${API_BASE_URL}/auth/admin/update-username`,
  UPDATE_PASSWORD: `${API_BASE_URL}/auth/admin/update-password`,
  DELETE_USER: `${API_BASE_URL}/auth/admin/delete-user`,
  PASSWORD_HISTORY: `${API_BASE_URL}/auth/admin/password-history`,

  // Revenue endpoints
  REVENUE: `${API_BASE_URL}/revenue`,
  REVENUE_SUMMARY: `${API_BASE_URL}/revenue/summary`,
  REVENUE_OCCUPANCY: `${API_BASE_URL}/revenue/occupancy`,
  REVENUE_REFRESH: `${API_BASE_URL}/revenue/refresh`,
  REVENUE_CACHE_STATS: `${API_BASE_URL}/revenue/cache-stats`,
  REVENUE_CLEAR_CACHE: `${API_BASE_URL}/revenue/clear-cache`,
  REVENUE_WARM_CACHE: `${API_BASE_URL}/revenue/warm-cache`,
  REVENUE_HEALTH: `${API_BASE_URL}/revenue/health`,
  REVENUE_REFRESH_LISTINGS: `${API_BASE_URL}/revenue/refresh-listings`,
  REVENUE_LISTINGS: `${API_BASE_URL}/revenue/listings`,
  REVENUE_CLEAR_LISTINGS_CACHE: `${API_BASE_URL}/revenue/clear-listings-cache`,
  REVENUE_CRON: `${API_BASE_URL}/revenue/cron`,
  REVENUE_TEST_MONTHLY_TARGET: `${API_BASE_URL}/revenue/test-monthly-target`,

  // Teable endpoints
  TEABLE_STATUS: `${API_BASE_URL}/teable/status`,
  TEABLE_START: `${API_BASE_URL}/teable/start`,
  TEABLE_STOP: `${API_BASE_URL}/teable/stop`,
  TEABLE_RESET_COOLDOWN: `${API_BASE_URL}/teable/reset-cooldown`,
  TEABLE_POSTING_STATUS: `${API_BASE_URL}/teable/posting-status`,
  TEABLE_TEST_CONNECTION: `${API_BASE_URL}/teable/test-connection`,
  TEABLE_MANUAL_POST: `${API_BASE_URL}/teable/manual-post`,
  TEABLE_POST_SPECIFIC: `${API_BASE_URL}/teable/post-specific`,
  TEABLE_DEBUG_HOUR_CHECK: `${API_BASE_URL}/teable/debug-hour-check`,

  // Monthly target
  MONTHLY_TARGET: `${API_BASE_URL}/monthly-target`,

  // Occupancy endpoints
  OCCUPANCY_CURRENT: `${API_BASE_URL}/occupancy/current`,
  OCCUPANCY_HEALTH: `${API_BASE_URL}/occupancy/health`,
  OCCUPANCY_REPORT: `${API_BASE_URL}/occupancy/report`,

  // Rooms endpoints
  ROOMS_LISTINGS: `${API_BASE_URL}/rooms/listings`,
  ROOMS_LISTING_BY_ID: `${API_BASE_URL}/rooms/listings`, // + /:id
  ROOMS_CLEANING_STATUS: `${API_BASE_URL}/rooms/cleaning-status`,
  ROOMS_UPDATE_CLEANING_STATUS_OLD: `${API_BASE_URL}/rooms/cleaning-status`, // + /:id (PUT)
  ROOMS_UPDATE_CLEANING_STATUS: `${API_BASE_URL}/rooms/update-cleaning-status`,
  ROOMS_HEALTH: `${API_BASE_URL}/rooms/health`,
  ROOMS_TEST_CORS: `${API_BASE_URL}/rooms/test-cors`,
  ROOMS_TEST_TEABLE: `${API_BASE_URL}/rooms/test-teable`,

  // Payment endpoints
  PAYMENT_TODAY_RESERVATIONS: `${API_BASE_URL}/payment/today-reservations`,
  PAYMENT_RESERVATION_BY_ID: `${API_BASE_URL}/payment/reservation`, // + /:id
  PAYMENT_HEALTH: `${API_BASE_URL}/payment/health`,

  // Portal URLs
  PORTAL_AUTH_URL: 'https://portal.namuve.com/authentication/sign-in',
};

export default API_ENDPOINTS;
