/**
 * Offline Detection Service
 * Monitors internet connectivity and provides callbacks for online/offline events
 */

class OfflineService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = [];
    this.init();
  }

  init() {
    // Listen to browser online/offline events for immediate detection
    window.addEventListener('online', this.handleOnlineEvent.bind(this));
    window.addEventListener('offline', this.handleOfflineEvent.bind(this));

    // Perform initial connectivity check only once
    this.checkInitialConnectivity();

    // Log initial status
    console.log('OfflineService initialized. Initial status:', this.isOnline ? 'ONLINE' : 'OFFLINE');
  }

  async checkInitialConnectivity() {
    // Only check connectivity once at startup
    // After this, rely entirely on browser events
    if (!navigator.onLine) {
      this.handleOffline();
      return;
    }

    // Quick initial test to verify actual connectivity
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      this.handleOnline();
    } catch (error) {
      console.log('Initial connectivity test failed:', error.message);
      this.handleOffline();
    }
  }


  // Immediate event handlers for browser online/offline events
  handleOnlineEvent() {
    console.log('Browser event: Going ONLINE');
    this.handleOnline();
  }

  handleOfflineEvent() {
    console.log('Browser event: Going OFFLINE');
    this.handleOffline();
  }

  handleOnline() {
    if (!this.isOnline) {
      console.log('Status change: Going ONLINE');
      this.isOnline = true;
      this.notifyListeners(true);
    }
  }

  handleOffline() {
    if (this.isOnline) {
      console.log('Status change: Going OFFLINE');
      this.isOnline = false;
      this.notifyListeners(false);
    }
  }

  notifyListeners(isOnline) {
    console.log('Notifying listeners. Status:', isOnline ? 'ONLINE' : 'OFFLINE');
    this.listeners.forEach(callback => {
      try {
        callback(isOnline);
      } catch (error) {
        console.error('Error in offline service listener:', error);
      }
    });
  }

  // Subscribe to connectivity changes
  subscribe(callback) {
    this.listeners.push(callback);
    console.log('New listener subscribed. Total listeners:', this.listeners.length);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
        console.log('Listener unsubscribed. Remaining listeners:', this.listeners.length);
      }
    };
  }

  // Get current connectivity status
  getStatus() {
    return this.isOnline;
  }

  // Cleanup
  destroy() {
    window.removeEventListener('online', this.handleOnlineEvent.bind(this));
    window.removeEventListener('offline', this.handleOfflineEvent.bind(this));
    
    this.listeners = [];
  }
}

// Create singleton instance
const offlineService = new OfflineService();

export default offlineService;
