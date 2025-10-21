class SessionService {
  constructor() {
    this.inactivityTimer = null;
    this.logoutCallback = null;
    this.isActive = false;
    
    // Session configuration - Only inactivity timeout (dynamic)
    this.INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour of inactivity = logout
    
    // Bind methods
    this.handleActivity = this.handleActivity.bind(this);
    this.startSession = this.startSession.bind(this);
    this.endSession = this.endSession.bind(this);
  }

  // Initialize session timeout system
  startSession(logoutCallback) {
    this.logoutCallback = logoutCallback;
    this.isActive = true;
    
    // Store session start time and last activity time
    const currentTime = Date.now();
    localStorage.setItem('sessionStartTime', currentTime.toString());
    localStorage.setItem('lastActivityTime', currentTime.toString());
    
    // Start inactivity monitoring (1 hour of no activity = logout)
    this.resetInactivityTimer();
    
    // Add activity listeners
    this.addActivityListeners();
    
    // console.log('🕐 Dynamic session started - logout after 1 hour of inactivity');
  }

  // Reset inactivity timer on user interaction
  resetInactivityTimer() {
    if (!this.isActive) return;
    
    // Clear existing inactivity timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    // Update last activity time
    const currentTime = Date.now();
    localStorage.setItem('lastActivityTime', currentTime.toString());
    
    // console.log('🔄 Activity detected - inactivity timer reset (1 hour from now)');
    
    // Set new inactivity timeout (1 hour from now)
    this.inactivityTimer = setTimeout(() => {
      this.performLogout('Session expired after 1 hour of inactivity');
    }, this.INACTIVITY_TIMEOUT);
  }

  // Handle user activity
  handleActivity() {
    if (this.isActive) {
      this.resetInactivityTimer();
    }
  }

  // Add event listeners for user activity
  addActivityListeners() {
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];
    
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, true);
    });
  }

  // Remove event listeners
  removeActivityListeners() {
    const events = [
      'mousedown',
      'mousemove',
      'keypress', 
      'scroll',
      'touchstart',
      'click'
    ];
    
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity, true);
    });
  }

  // Perform logout
  performLogout(reason) {
    // console.log(`🚪 ${reason}`);
    
    if (this.logoutCallback && typeof this.logoutCallback === 'function') {
      this.logoutCallback();
    }
    
    this.endSession();
  }

  // End session and cleanup
  endSession() {
    this.isActive = false;
    
    // Clear inactivity timer
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    
    // Remove activity listeners
    this.removeActivityListeners();
    
    // Clear session storage
    localStorage.removeItem('sessionStartTime');
    localStorage.removeItem('lastActivityTime');
    
    // console.log('🔒 Session ended and cleaned up');
  }

  // Check if session is still valid (for page refresh scenarios)
  isSessionValid() {
    const lastActivityTime = parseInt(localStorage.getItem('lastActivityTime') || '0');
    
    if (!lastActivityTime) {
      return false;
    }
    
    const now = Date.now();
    const timeSinceActivity = now - lastActivityTime;
    
    // Check if inactive for more than 1 hour
    if (timeSinceActivity >= this.INACTIVITY_TIMEOUT) {
      return false;
    }
    
    return true;
  }

  // Get remaining inactivity time
  getRemainingTime() {
    const lastActivityTime = parseInt(localStorage.getItem('lastActivityTime') || '0');
    
    if (!lastActivityTime) {
      return 0;
    }
    
    const now = Date.now();
    const timeSinceActivity = now - lastActivityTime;
    const remainingTime = this.INACTIVITY_TIMEOUT - timeSinceActivity;
    
    // Return remaining time until inactivity logout (can be negative if expired)
    return Math.max(remainingTime, 0);
  }
}

// Create singleton instance
const sessionService = new SessionService();

export default sessionService;
