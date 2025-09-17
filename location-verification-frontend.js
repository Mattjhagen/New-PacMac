/**
 * Frontend Location Verification for PacMac Marketplace
 * Handles proximity verification and directions for transactions
 */

class LocationVerificationFrontend {
  constructor() {
    this.GOOGLE_MAPS_API_KEY = window.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'; // Will be set from environment
    this.PROXIMITY_RADIUS_FEET = 100;
    this.map = null;
    this.directionsService = null;
    this.directionsRenderer = null;
  }

  /**
   * Initialize Google Maps and location services
   */
  async initializeMaps() {
    if (typeof google === 'undefined') {
      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      return new Promise((resolve, reject) => {
        script.onload = () => {
          try {
            this.directionsService = new google.maps.DirectionsService();
            this.directionsRenderer = new google.maps.DirectionsRenderer();
            console.log('✅ Google Maps API initialized successfully');
            resolve();
          } catch (error) {
            console.error('❌ Failed to initialize Google Maps services:', error);
            reject(error);
          }
        };
        script.onerror = () => {
          reject(new Error('Failed to load Google Maps API'));
        };
      });
    } else {
      // Google Maps already loaded
      try {
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer();
        console.log('✅ Google Maps API already available');
      } catch (error) {
        console.error('❌ Failed to initialize Google Maps services:', error);
        throw error;
      }
    }
  }

  /**
   * Get user's current location
   */
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const point1 = new google.maps.LatLng(lat1, lng1);
    const point2 = new google.maps.LatLng(lat2, lng2);
    return google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
  }

  /**
   * Convert meters to feet
   */
  metersToFeet(meters) {
    return meters * 3.28084;
  }

  /**
   * Verify proximity to transaction location
   */
  async verifyProximity(transactionLocation) {
    try {
      const customerLocation = await this.getCurrentLocation();
      const distanceMeters = this.calculateDistance(
        customerLocation.lat,
        customerLocation.lng,
        transactionLocation.lat,
        transactionLocation.lng
      );

      const distanceFeet = this.metersToFeet(distanceMeters);
      const isWithinRange = distanceFeet <= this.PROXIMITY_RADIUS_FEET;

      return {
        isWithinRange,
        distanceMeters: Math.round(distanceMeters),
        distanceFeet: Math.round(distanceFeet),
        maxDistanceFeet: this.PROXIMITY_RADIUS_FEET,
        customerLocation,
        transactionLocation
      };
    } catch (error) {
      throw new Error(`Location verification failed: ${error.message}`);
    }
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(address) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?` +
                `address=${encodeURIComponent(address)}&key=${this.GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          success: true,
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id
        };
      } else {
        return {
          success: false,
          error: data.error_message || 'Address not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get directions to transaction location
   */
  async getDirections(transactionLocation) {
    try {
      // Check if Google Maps services are initialized
      if (!this.directionsService || !google || !google.maps) {
        throw new Error('Google Maps services not initialized. Please ensure the API key is correct and the Maps API is loaded.');
      }

      const customerLocation = await this.getCurrentLocation();
      
      const request = {
        origin: new google.maps.LatLng(customerLocation.lat, customerLocation.lng),
        destination: new google.maps.LatLng(transactionLocation.lat, transactionLocation.lng),
        travelMode: google.maps.TravelMode.DRIVING
      };

      return new Promise((resolve, reject) => {
        this.directionsService.route(request, (result, status) => {
          if (status === 'OK') {
            const route = result.routes[0];
            const leg = route.legs[0];
            
            resolve({
              success: true,
              distance: leg.distance,
              duration: leg.duration,
              steps: leg.steps.map(step => ({
                instruction: step.instructions,
                distance: step.distance,
                duration: step.duration
              })),
              polyline: route.overview_polyline.points
            });
          } else {
            reject(new Error(`Directions failed: ${status}`));
          }
        });
      });
    } catch (error) {
      throw new Error(`Directions failed: ${error.message}`);
    }
  }

  /**
   * Display directions on map
   */
  displayDirections(transactionLocation, mapElementId = 'map') {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if Google Maps services are initialized
        if (!this.directionsService || !this.directionsRenderer || !google || !google.maps) {
          throw new Error('Google Maps services not initialized. Please ensure the API key is correct and the Maps API is loaded.');
        }

        const customerLocation = await this.getCurrentLocation();
        
        // Initialize map
        this.map = new google.maps.Map(document.getElementById(mapElementId), {
          zoom: 15,
          center: new google.maps.LatLng(customerLocation.lat, customerLocation.lng)
        });

        this.directionsRenderer.setMap(this.map);

        const request = {
          origin: new google.maps.LatLng(customerLocation.lat, customerLocation.lng),
          destination: new google.maps.LatLng(transactionLocation.lat, transactionLocation.lng),
          travelMode: google.maps.TravelMode.DRIVING
        };

        this.directionsService.route(request, (result, status) => {
          if (status === 'OK') {
            this.directionsRenderer.setDirections(result);
            resolve(result);
          } else {
            reject(new Error(`Directions failed: ${status}`));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Show proximity verification UI
   */
  showProximityVerification(transactionLocation) {
    const modal = document.createElement('div');
    modal.className = 'proximity-verification-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>📍 Location Verification</h3>
        <p>Please allow location access to verify you're within 100 feet of the meeting point.</p>
        <div id="verification-status" class="verification-status">
          <div class="loading">Checking your location...</div>
        </div>
        <div id="directions-container" class="directions-container" style="display: none;">
          <h4>Directions to Meeting Point</h4>
          <div id="map" style="height: 300px; width: 100%;"></div>
          <div id="directions-steps"></div>
        </div>
        <div class="modal-actions">
          <button id="verify-location-btn" class="btn-primary">Verify Location</button>
          <button id="get-directions-btn" class="btn-secondary">Get Directions</button>
          <button id="close-modal-btn" class="btn-cancel">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    document.getElementById('verify-location-btn').addEventListener('click', async () => {
      await this.handleLocationVerification(transactionLocation);
    });

    document.getElementById('get-directions-btn').addEventListener('click', async () => {
      await this.handleGetDirections(transactionLocation);
    });

    document.getElementById('close-modal-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    return modal;
  }

  /**
   * Handle location verification
   */
  async handleLocationVerification(transactionLocation) {
    const statusElement = document.getElementById('verification-status');
    
    try {
      statusElement.innerHTML = '<div class="loading">Verifying your location...</div>';
      
      const result = await this.verifyProximity(transactionLocation);
      
      if (result.isWithinRange) {
        statusElement.innerHTML = `
          <div class="success">
            ✅ <strong>Location Verified!</strong><br>
            You are ${result.distanceFeet} feet away (within 100ft range)
          </div>
        `;
        
        // Enable transaction confirmation
        this.enableTransactionConfirmation();
      } else {
        statusElement.innerHTML = `
          <div class="warning">
            ⚠️ <strong>Too Far Away</strong><br>
            You are ${result.distanceFeet} feet away (need to be within 100ft)
          </div>
        `;
        
        // Show directions
        document.getElementById('directions-container').style.display = 'block';
        await this.displayDirections(transactionLocation);
      }
    } catch (error) {
      statusElement.innerHTML = `
        <div class="error">
          ❌ <strong>Verification Failed</strong><br>
          ${error.message}
        </div>
      `;
    }
  }

  /**
   * Handle getting directions
   */
  async handleGetDirections(transactionLocation) {
    try {
      document.getElementById('directions-container').style.display = 'block';
      await this.displayDirections(transactionLocation);
    } catch (error) {
      alert(`Failed to get directions: ${error.message}`);
    }
  }

  /**
   * Enable transaction confirmation
   */
  enableTransactionConfirmation() {
    // This would integrate with your existing transaction system
    console.log('Transaction confirmation enabled - customer is within range');
    
    // You could trigger a callback or emit an event here
    if (window.onLocationVerified) {
      window.onLocationVerified();
    }
  }
}

// CSS for the proximity verification modal
const proximityVerificationCSS = `
.proximity-verification-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.verification-status {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
}

.verification-status .loading {
  color: #666;
  text-align: center;
}

.verification-status .success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.verification-status .warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.verification-status .error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.directions-container {
  margin-top: 1rem;
}

.directions-container h4 {
  margin-bottom: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.btn-primary, .btn-secondary, .btn-cancel {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-cancel {
  background: #dc3545;
  color: white;
}

.btn-primary:hover, .btn-secondary:hover, .btn-cancel:hover {
  opacity: 0.9;
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = proximityVerificationCSS;
document.head.appendChild(style);

// Export for use
window.LocationVerificationFrontend = LocationVerificationFrontend;
