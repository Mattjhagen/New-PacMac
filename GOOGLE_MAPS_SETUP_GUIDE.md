# Google Maps Platform Setup Guide for PacMac Marketplace

## Overview
This guide helps you set up Google Maps Platform APIs for proximity verification (100ft radius) and customer directions in your PacMac Marketplace application.

## Required Google Maps APIs

### 1. **Google Maps JavaScript API**
- **Purpose**: Client-side maps, geolocation, and directions
- **Usage**: Display maps, get user location, show directions
- **Billing**: Pay per map load and API call

### 2. **Google Maps Geocoding API**
- **Purpose**: Convert addresses to coordinates
- **Usage**: Validate meeting locations, geocode addresses
- **Billing**: Pay per geocoding request

### 3. **Google Maps Directions API**
- **Purpose**: Get turn-by-turn directions
- **Usage**: Provide navigation to meeting points
- **Billing**: Pay per directions request

### 4. **Google Maps Distance Matrix API** (Optional)
- **Purpose**: Calculate distances between multiple points
- **Usage**: Batch proximity calculations
- **Billing**: Pay per distance calculation

## Setup Steps

### Step 1: Enable APIs in Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Library**
4. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
   - Distance Matrix API (optional)

### Step 2: Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy your API key
4. **Important**: Restrict your API key for security:
   - Go to your API key settings
   - Under **Application restrictions**, select **HTTP referrers**
   - Add your domains:
     - `https://new-pacmac.onrender.com/*`
     - `http://localhost:3000/*` (for development)
   - Under **API restrictions**, select **Restrict key**
   - Choose the APIs you enabled

### Step 3: Configure Environment Variables
Add to your `.env` file:
```bash
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Step 4: Update Frontend Configuration
In `location-verification-frontend.js`, replace:
```javascript
this.GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
```
with your actual API key or use environment variable.

## Implementation Features

### Proximity Verification (100ft Radius)
- **Function**: `verifyProximity()`
- **Accuracy**: Uses Haversine formula for precise distance calculation
- **Range**: 100 feet (30.48 meters)
- **Real-time**: Uses browser geolocation API

### Customer Directions
- **Function**: `getDirections()`
- **Features**: Turn-by-turn directions, distance, duration
- **Display**: Interactive map with route visualization
- **Modes**: Driving, walking, transit (configurable)

### Transaction Confirmation
- **Integration**: Works with existing transaction system
- **Security**: Verifies customer is physically present
- **UX**: Modal interface with clear status indicators

## Usage Examples

### Basic Proximity Check
```javascript
const locationVerifier = new LocationVerificationFrontend();
await locationVerifier.initializeMaps();

const transactionLocation = {
  lat: 40.7128,
  lng: -74.0060
};

const result = await locationVerifier.verifyProximity(transactionLocation);
if (result.isWithinRange) {
  console.log('Customer is within 100ft - transaction can proceed');
} else {
  console.log(`Customer is ${result.distanceFeet}ft away - show directions`);
}
```

### Get Directions
```javascript
const directions = await locationVerifier.getDirections(transactionLocation);
console.log(`Distance: ${directions.distance.text}`);
console.log(`Duration: ${directions.duration.text}`);
```

### Show Verification Modal
```javascript
const modal = locationVerifier.showProximityVerification(transactionLocation);
```

## API Endpoints

### POST `/api/verify-transaction-location`
Verify if customer is within 100ft of meeting location.

**Request:**
```json
{
  "transactionId": "tx_123",
  "customerLocation": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "meetingLocation": {
    "lat": 40.7130,
    "lng": -74.0058
  }
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "proximity": {
    "isWithinRange": true,
    "distanceMeters": 25,
    "distanceFeet": 82,
    "maxDistanceFeet": 100
  }
}
```

### POST `/api/get-directions`
Get directions from customer to meeting location.

**Request:**
```json
{
  "customerLocation": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "meetingLocation": {
    "lat": 40.7130,
    "lng": -74.0058
  }
}
```

### POST `/api/geocode-address`
Convert address to coordinates.

**Request:**
```json
{
  "address": "123 Main St, New York, NY"
}
```

## Security Considerations

### API Key Security
- **Restrict by domain**: Only allow your production domains
- **Restrict by API**: Only enable required APIs
- **Monitor usage**: Set up billing alerts
- **Rotate keys**: Regularly update API keys

### Location Privacy
- **User consent**: Always request location permission
- **Data handling**: Don't store location data unnecessarily
- **GDPR compliance**: Follow privacy regulations
- **Secure transmission**: Use HTTPS only

## Billing and Costs

### Typical Costs (as of 2024)
- **Maps JavaScript API**: $7 per 1,000 map loads
- **Geocoding API**: $5 per 1,000 requests
- **Directions API**: $5 per 1,000 requests
- **Distance Matrix API**: $5 per 1,000 elements

### Cost Optimization
- **Caching**: Cache geocoding results
- **Batch requests**: Use Distance Matrix for multiple calculations
- **Usage limits**: Set daily quotas
- **Monitoring**: Track API usage in Google Cloud Console

## Testing

### Local Development
```bash
# Test location verification
curl -X POST http://localhost:3000/api/verify-transaction-location \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "test_123",
    "customerLocation": {"lat": 40.7128, "lng": -74.0060},
    "meetingLocation": {"lat": 40.7130, "lng": -74.0058}
  }'
```

### Production Testing
1. Deploy to Render
2. Test with real locations
3. Verify proximity calculations
4. Test directions functionality
5. Monitor API usage

## Troubleshooting

### Common Issues
1. **API key not working**: Check restrictions and billing
2. **Location permission denied**: Handle gracefully with fallbacks
3. **High accuracy required**: Use `enableHighAccuracy: true`
4. **Network errors**: Implement retry logic
5. **CORS issues**: Configure proper origins

### Error Handling
```javascript
try {
  const result = await locationVerifier.verifyProximity(location);
} catch (error) {
  if (error.code === 1) {
    // Permission denied
    showLocationPermissionModal();
  } else if (error.code === 2) {
    // Position unavailable
    showLocationErrorModal();
  } else {
    // Timeout or other error
    showGenericErrorModal();
  }
}
```

## Next Steps
1. **Enable APIs** in Google Cloud Console
2. **Create and restrict API key**
3. **Add environment variable**
4. **Test locally** with sample locations
5. **Deploy and test** in production
6. **Monitor usage** and costs
7. **Integrate** with transaction flow

## Support Resources
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Maps JavaScript API Reference](https://developers.google.com/maps/documentation/javascript)
- [Geocoding API Reference](https://developers.google.com/maps/documentation/geocoding)
- [Directions API Reference](https://developers.google.com/maps/documentation/directions)
