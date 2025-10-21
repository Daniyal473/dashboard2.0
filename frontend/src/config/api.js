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
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  VERIFY_ADMIN: `${API_BASE_URL}/api/auth/admin/verify`,

  // User endpoints
  USERS: `${API_BASE_URL}/api/auth/admin/users`,
  CREATE_USER: `${API_BASE_URL}/api/auth/admin/create-user`,
  UPDATE_USER_ROLE: `${API_BASE_URL}/api/auth/admin/update-role`,
  UPDATE_USERNAME: `${API_BASE_URL}/api/auth/admin/update-username`,
  DELETE_USER: `${API_BASE_URL}/api/auth/admin/delete-user`,
  PASSWORD_HISTORY: `${API_BASE_URL}/api/auth/admin/password-history`,

  // Revenue endpoints
  REVENUE: `${API_BASE_URL}/api/revenue`,
  REVENUE_HEALTH: `${API_BASE_URL}/api/revenue/health`,

  // Teable endpoints
  TEABLE: `${API_BASE_URL}/api/teable`,
  TEABLE_STATUS: `${API_BASE_URL}/api/teable/status`,

  // Monthly target
  MONTHLY_TARGET: `${API_BASE_URL}/api/monthly-target`,
};

export default API_ENDPOINTS;
