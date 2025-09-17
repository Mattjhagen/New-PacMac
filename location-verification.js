/**
 * Google Maps Location Verification System
 * Handles proximity verification (100ft radius) and customer directions
 */

class LocationVerification {
  constructor() {
    this.GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    this.PROXIMITY_RADIUS_FEET = 100;
    this.PROXIMITY_RADIUS_METERS = 30.48; // 100 feet in meters
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in meters
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Convert meters to feet
   * @param {number} meters - Distance in meters
   * @returns {number} Distance in feet
   */
  metersToFeet(meters) {
    return meters * 3.28084;
  }

  /**
   * Verify if customer is within 100 feet of transaction location
   * @param {Object} customerLocation - Customer's current location
   * @param {Object} transactionLocation - Transaction meeting point
   * @returns {Object} Verification result
   */
  verifyProximity(customerLocation, transactionLocation) {
    const distance = this.calculateDistance(
      customerLocation.lat,
      customerLocation.lng,
      transactionLocation.lat,
      transactionLocation.lng
    );

    const distanceFeet = this.metersToFeet(distance);
    const isWithinRange = distance <= this.PROXIMITY_RADIUS_METERS;

    return {
      isWithinRange,
      distanceMeters: Math.round(distance),
      distanceFeet: Math.round(distanceFeet),
      maxDistanceFeet: this.PROXIMITY_RADIUS_FEET,
      customerLocation,
      transactionLocation
    };
  }

  /**
   * Get directions from customer location to transaction location
   * @param {Object} customerLocation - Customer's current location
   * @param {Object} transactionLocation - Transaction meeting point
   * @returns {Promise<Object>} Directions data
   */
  async getDirections(customerLocation, transactionLocation) {
    const origin = `${customerLocation.lat},${customerLocation.lng}`;
    const destination = `${transactionLocation.lat},${transactionLocation.lng}`;
    
    const url = `https://maps.googleapis.com/maps/api/directions/json?` +
                `origin=${origin}&destination=${destination}&key=${this.GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        return {
          success: true,
          distance: leg.distance,
          duration: leg.duration,
          steps: leg.steps.map(step => ({
            instruction: step.html_instructions,
            distance: step.distance,
            duration: step.duration
          })),
          polyline: route.overview_polyline.points
        };
      } else {
        return {
          success: false,
          error: data.error_message || 'Directions not available'
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
   * Get customer's current location using browser geolocation
   * @returns {Promise<Object>} Customer's coordinates
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
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Geocode an address to get coordinates
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Geocoded coordinates
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
   * Complete transaction verification with proximity check
   * @param {string} transactionId - Transaction ID
   * @param {Object} meetingLocation - Meeting location coordinates
   * @returns {Promise<Object>} Verification result
   */
  async verifyTransactionLocation(transactionId, meetingLocation) {
    try {
      // Get customer's current location
      const customerLocation = await this.getCurrentLocation();
      
      // Verify proximity
      const proximityResult = this.verifyProximity(customerLocation, meetingLocation);
      
      // Get directions if not within range
      let directions = null;
      if (!proximityResult.isWithinRange) {
        directions = await this.getDirections(customerLocation, meetingLocation);
      }

      return {
        transactionId,
        verified: proximityResult.isWithinRange,
        proximity: proximityResult,
        directions,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        transactionId,
        verified: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = LocationVerification;
