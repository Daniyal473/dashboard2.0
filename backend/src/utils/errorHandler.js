const axios = require('./connectionPool');
const { makeRequestWithRetry, RateLimiter } = require('./apiHelper');

// Rate limiters for different API endpoints
const generalRateLimiter = new RateLimiter(10, 1000); // 10 requests per second
const financeRateLimiter = new RateLimiter(5, 1000);  // 5 requests per second for finance API

class ErrorHandler {
  constructor() {
    this.retryDelays = [1000, 2000, 4000, 8000]; // Exponential backoff
    this.maxRetries = 3;
  }

  async makeApiCall(url, options = {}, maxRetries = 3) {
    await generalRateLimiter.waitForSlot();
    
    return makeRequestWithRetry(url, {
      timeout: 30000,
      ...options
    }, maxRetries);
  }

  async makeFinanceCall(url, authToken, reservationId, maxRetries = 3) {
    await financeRateLimiter.waitForSlot();
    
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: authToken,
            'Content-Type': 'application/json'
          },
          timeout: 45000 // Longer timeout for finance API
        });
        
        return response;
      } catch (error) {
        lastError = error;
        
        // Handle specific error cases
        if (error.response) {
          const status = error.response.status;
          
          // Don't retry on client errors (4xx)
          if (status >= 400 && status < 500) {
            if (status === 404) {
              console.warn(`Finance data not found for reservation ${reservationId}`);
              // Return a mock response for 404s
              return {
                data: {
                  status: 'error',
                  message: 'Finance data not found',
                  result: null
                }
              };
            }
            throw error;
          }
          
          // Handle rate limiting (429)
          if (status === 429) {
            const retryAfter = error.response.headers['retry-after'];
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : this.retryDelays[attempt - 1] || 8000;
            console.log(`Rate limited for reservation ${reservationId}, waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        
        // If this isn't the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const waitTime = this.retryDelays[attempt - 1] || 8000;
          console.log(`Finance API call failed for reservation ${reservationId} (attempt ${attempt}/${maxRetries}), retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // If all retries failed, return a mock response to prevent breaking the flow
    console.error(`All finance API attempts failed for reservation ${reservationId}`);
    return {
      data: {
        status: 'error',
        message: 'Finance API unavailable after retries',
        result: null
      }
    };
  }

  handleError(error, context = '') {
    const errorInfo = {
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };

    if (error.response) {
      errorInfo.status = error.response.status;
      errorInfo.statusText = error.response.statusText;
      errorInfo.data = error.response.data;
    } else if (error.request) {
      errorInfo.type = 'Network Error';
      errorInfo.request = {
        url: error.config?.url,
        method: error.config?.method
      };
    }

    // Log error (in production, you might want to send to a logging service)
    console.error('API Error:', JSON.stringify(errorInfo, null, 2));

    return errorInfo;
  }

  isRetryableError(error) {
    // Network errors are retryable
    if (!error.response) {
      return true;
    }

    const status = error.response.status;
    
    // Server errors (5xx) are retryable
    if (status >= 500) {
      return true;
    }
    
    // Rate limiting is retryable
    if (status === 429) {
      return true;
    }
    
    // Timeout errors are retryable
    if (status === 408) {
      return true;
    }
    
    return false;
  }

  async withRetry(fn, maxRetries = 3, context = '') {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (!this.isRetryableError(error) || attempt === maxRetries) {
          this.handleError(error, context);
          throw error;
        }
        
        const waitTime = this.retryDelays[attempt - 1] || 8000;
        console.log(`${context} failed (attempt ${attempt}/${maxRetries}), retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError;
  }
}

// Export singleton instance
module.exports = new ErrorHandler();
