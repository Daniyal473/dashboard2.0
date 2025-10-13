class SessionService {
  constructor() {
    this.sessionTimer = null;
    this.activityTimer = null;
    this.logoutCallback = null;
    this.isActive = false;
    
    // Session configuration
    this.SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
    this.ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    // Bind methods
    this.handleActivity = this.handleActivity.bind(this);
    this.startSession = this.startSession.bind(this);
    this.endSession = this.endSession.bind(this);
  }

  // Initialize session timeout system
  startSession(logoutCallback) {
    this.logoutCallback = logoutCallback;
    this.isActive = true;
    
    // Store session start time
    const sessionStartTime = Date.now();
    localStorage.setItem('sessionStartTime', sessionStartTime.toString());
    
    // Set absolute session timeout (1 hour)
    this.sessionTimer = setTimeout(() => {
      this.performLogout('Session expired after 1 hour');
    }, this.SESSION_DURATION);
    
    // Set initial activity timeout (30 minutes)
    this.resetActivityTimer();
    
    // Add activity listeners
    this.addActivityListeners();
    
    console.log('🕐 Session started - 1 hour timeout active');
  }

  // Reset activity timer on user interaction
  resetActivityTimer() {
    if (!this.isActive) return;
    
    // Clear existing activity timer
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    
    // Update last activity time
    localStorage.setItem('lastActivityTime', Date.now().toString());
    
    // Check if we're still within the 1-hour absolute limit
    const sessionStartTime = parseInt(localStorage.getItem('sessionStartTime') || '0');
    const timeElapsed = Date.now() - sessionStartTime;
    
    if (timeElapsed >= this.SESSION_DURATION) {
      this.performLogout('Session expired after 1 hour');
      return;
    }
    
    // Set new activity timeout (30 minutes from now)
    this.activityTimer = setTimeout(() => {
      this.performLogout('Session expired due to inactivity');
    }, this.ACTIVITY_TIMEOUT);
  }

  // Handle user activity
  handleActivity() {
    if (this.isActive) {
      this.resetActivityTimer();
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
    console.log(`🚪 ${reason}`);
    
    if (this.logoutCallback && typeof this.logoutCallback === 'function') {
      this.logoutCallback();
    }
    
    this.endSession();
  }

  // End session and cleanup
  endSession() {
    this.isActive = false;
    
    // Clear timers
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
    
    // Remove activity listeners
    this.removeActivityListeners();
    
    // Clear session storage
    localStorage.removeItem('sessionStartTime');
    localStorage.removeItem('lastActivityTime');
    
    console.log('🔒 Session ended and cleaned up');
  }

  // Check if session is still valid (for page refresh scenarios)
  isSessionValid() {
    const sessionStartTime = parseInt(localStorage.getItem('sessionStartTime') || '0');
    const lastActivityTime = parseInt(localStorage.getItem('lastActivityTime') || '0');
    
    if (!sessionStartTime || !lastActivityTime) {
      return false;
    }
    
    const now = Date.now();
    const sessionAge = now - sessionStartTime;
    const timeSinceActivity = now - lastActivityTime;
    
    // Check if session has exceeded 1 hour absolute limit
    if (sessionAge >= this.SESSION_DURATION) {
      return false;
    }
    
    // Check if inactive for more than 30 minutes
    if (timeSinceActivity >= this.ACTIVITY_TIMEOUT) {
      return false;
    }
    
    return true;
  }

  // Get remaining session time
  getRemainingTime() {
    const sessionStartTime = parseInt(localStorage.getItem('sessionStartTime') || '0');
    const lastActivityTime = parseInt(localStorage.getItem('lastActivityTime') || '0');
    
    if (!sessionStartTime || !lastActivityTime) {
      return 0;
    }
    
    const now = Date.now();
    const sessionTimeRemaining = this.SESSION_DURATION - (now - sessionStartTime);
    const activityTimeRemaining = this.ACTIVITY_TIMEOUT - (now - lastActivityTime);
    
    // Return the shorter of the two timeouts
    return Math.min(sessionTimeRemaining, activityTimeRemaining);
  }
}

// Create singleton instance
const sessionService = new SessionService();

export default sessionService;
