/**
 * Client-Side Bidding Timer System
 * 
 * This system manages bidding timers on the client side using localStorage
 * to persist timer data across page reloads and server restarts.
 * 
 * Features:
 * - Persistent timers that survive page reloads
 * - Automatic timer restoration
 * - Real-time countdown display
 * - Event callbacks for timer events
 * - Works independently of server API
 */

class BiddingTimerSystem {
  constructor() {
    this.timers = new Map();
    this.intervals = new Map();
    this.callbacks = new Map();
    this.storageKey = 'pacmac_bidding_timers';
    
    // Initialize system
    this.loadTimersFromStorage();
    this.startTimerUpdates();
    
    console.log('🔄 Bidding Timer System initialized');
  }

  /**
   * Start a bidding timer for an item
   * @param {string} itemId - Unique item identifier
   * @param {number} duration - Timer duration in milliseconds
   * @param {Function} onEnd - Callback when timer ends
   * @param {Function} onUpdate - Callback for timer updates
   */
  startTimer(itemId, duration, onEnd = null, onUpdate = null) {
    const endTime = Date.now() + duration;
    
    const timerData = {
      itemId,
      endTime,
      duration,
      startTime: Date.now(),
      isActive: true
    };
    
    this.timers.set(itemId, timerData);
    this.saveTimersToStorage();
    
    // Store callbacks
    this.callbacks.set(itemId, { onEnd, onUpdate });
    
    console.log(`⏰ Started bidding timer for item ${itemId}, ends in ${Math.round(duration / 1000)}s`);
    
    return timerData;
  }

  /**
   * Get time left for a specific item
   * @param {string} itemId - Item identifier
   * @returns {number} - Time left in milliseconds
   */
  getTimeLeft(itemId) {
    const timer = this.timers.get(itemId);
    if (!timer || !timer.isActive) {
      return 0;
    }
    
    const timeLeft = timer.endTime - Date.now();
    return Math.max(0, timeLeft);
  }

  /**
   * Check if a timer is active
   * @param {string} itemId - Item identifier
   * @returns {boolean}
   */
  isTimerActive(itemId) {
    const timer = this.timers.get(itemId);
    if (!timer) return false;
    
    const timeLeft = this.getTimeLeft(itemId);
    return timeLeft > 0 && timer.isActive;
  }

  /**
   * Stop a timer
   * @param {string} itemId - Item identifier
   */
  stopTimer(itemId) {
    const timer = this.timers.get(itemId);
    if (timer) {
      timer.isActive = false;
      this.saveTimersToStorage();
      console.log(`⏹️ Stopped bidding timer for item ${itemId}`);
    }
  }

  /**
   * Get all active timers
   * @returns {Object} - Object with timer data
   */
  getAllTimers() {
    const result = {};
    this.timers.forEach((timer, itemId) => {
      if (timer.isActive) {
        result[itemId] = {
          ...timer,
          timeLeft: this.getTimeLeft(itemId)
        };
      }
    });
    return result;
  }

  /**
   * Format time for display
   * @param {number} milliseconds - Time in milliseconds
   * @returns {string} - Formatted time string
   */
  formatTime(milliseconds) {
    if (milliseconds <= 0) return '00:00:00';
    
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Save timers to localStorage
   */
  saveTimersToStorage() {
    try {
      const timerData = {};
      this.timers.forEach((timer, itemId) => {
        timerData[itemId] = timer;
      });
      localStorage.setItem(this.storageKey, JSON.stringify(timerData));
    } catch (error) {
      console.error('Failed to save timers to storage:', error);
    }
  }

  /**
   * Load timers from localStorage
   */
  loadTimersFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const timerData = JSON.parse(stored);
        Object.entries(timerData).forEach(([itemId, timer]) => {
          // Only restore active timers that haven't expired
          if (timer.isActive && timer.endTime > Date.now()) {
            this.timers.set(itemId, timer);
            console.log(`🔄 Restored timer for item ${itemId}`);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load timers from storage:', error);
    }
  }

  /**
   * Start the timer update loop
   */
  startTimerUpdates() {
    setInterval(() => {
      this.updateTimers();
    }, 1000); // Update every second
  }

  /**
   * Update all timers and trigger callbacks
   */
  updateTimers() {
    this.timers.forEach((timer, itemId) => {
      if (!timer.isActive) return;
      
      const timeLeft = this.getTimeLeft(itemId);
      const callbacks = this.callbacks.get(itemId);
      
      if (timeLeft <= 0) {
        // Timer ended
        timer.isActive = false;
        this.saveTimersToStorage();
        
        console.log(`🔔 Bidding ended for item ${itemId}`);
        
        if (callbacks && callbacks.onEnd) {
          callbacks.onEnd(itemId);
        }
      } else {
        // Timer update
        if (callbacks && callbacks.onUpdate) {
          callbacks.onUpdate(itemId, timeLeft);
        }
      }
    });
  }

  /**
   * Add demo timers for testing
   */
  addDemoTimers() {
    // Add some demo timers
    this.startTimer('demo_item_1', 2 * 60 * 60 * 1000, // 2 hours
      (itemId) => console.log(`Demo auction ended: ${itemId}`),
      (itemId, timeLeft) => console.log(`Demo timer update: ${itemId} - ${this.formatTime(timeLeft)}`)
    );
    
    this.startTimer('demo_item_2', 1 * 60 * 60 * 1000, // 1 hour
      (itemId) => console.log(`Demo auction ended: ${itemId}`),
      (itemId, timeLeft) => console.log(`Demo timer update: ${itemId} - ${this.formatTime(timeLeft)}`)
    );
    
    console.log('🎯 Added demo bidding timers');
  }

  /**
   * Create a timer display element
   * @param {string} itemId - Item identifier
   * @param {HTMLElement} container - Container element
   * @returns {HTMLElement} - Timer display element
   */
  createTimerDisplay(itemId, container) {
    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'bidding-timer';
    timerDisplay.style.cssText = `
      background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      margin: 5px 0;
    `;
    
    const updateDisplay = () => {
      const timeLeft = this.getTimeLeft(itemId);
      const isActive = this.isTimerActive(itemId);
      
      if (isActive && timeLeft > 0) {
        timerDisplay.innerHTML = `⏰ ${this.formatTime(timeLeft)}`;
        timerDisplay.style.display = 'block';
      } else if (timeLeft <= 0) {
        timerDisplay.innerHTML = '🔔 Bidding Ended';
        timerDisplay.style.background = '#95a5a6';
      } else {
        timerDisplay.style.display = 'none';
      }
    };
    
    // Update display immediately
    updateDisplay();
    
    // Update display every second
    setInterval(updateDisplay, 1000);
    
    container.appendChild(timerDisplay);
    return timerDisplay;
  }
}

// Create global instance
window.BiddingTimerSystem = new BiddingTimerSystem();

// Add demo timers for testing
window.BiddingTimerSystem.addDemoTimers();

// Expose utility functions globally
window.startBiddingTimer = (itemId, duration, onEnd, onUpdate) => {
  return window.BiddingTimerSystem.startTimer(itemId, duration, onEnd, onUpdate);
};

window.getBiddingTimeLeft = (itemId) => {
  return window.BiddingTimerSystem.getTimeLeft(itemId);
};

window.formatBiddingTime = (milliseconds) => {
  return window.BiddingTimerSystem.formatTime(milliseconds);
};

window.createBiddingTimerDisplay = (itemId, container) => {
  return window.BiddingTimerSystem.createTimerDisplay(itemId, container);
};

console.log('🎉 Bidding Timer System loaded and ready!');
