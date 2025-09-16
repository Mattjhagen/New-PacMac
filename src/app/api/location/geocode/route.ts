import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    // For demo purposes, we'll use a mock geocoding service
    // In production, use Google Maps API, Mapbox, or similar
    const mockGeocode = (address: string) => {
      // Simple mock geocoding based on common patterns
      const addressLower = address.toLowerCase()
      
      // Mock coordinates for common cities
      const cityCoordinates: Record<string, { lat: number, lng: number }> = {
        'new york': { lat: 40.7128, lng: -74.0060 },
        'los angeles': { lat: 34.0522, lng: -118.2437 },
        'chicago': { lat: 41.8781, lng: -87.6298 },
        'houston': { lat: 29.7604, lng: -95.3698 },
        'phoenix': { lat: 33.4484, lng: -112.0740 },
        'philadelphia': { lat: 39.9526, lng: -75.1652 },
        'san antonio': { lat: 29.4241, lng: -98.4936 },
        'san diego': { lat: 32.7157, lng: -117.1611 },
        'dallas': { lat: 32.7767, lng: -96.7970 },
        'san jose': { lat: 37.3382, lng: -121.8863 },
        'austin': { lat: 30.2672, lng: -97.7431 },
        'jacksonville': { lat: 30.3322, lng: -81.6557 },
        'fort worth': { lat: 32.7555, lng: -97.3308 },
        'columbus': { lat: 39.9612, lng: -82.9988 },
        'charlotte': { lat: 35.2271, lng: -80.8431 },
        'san francisco': { lat: 37.7749, lng: -122.4194 },
        'indianapolis': { lat: 39.7684, lng: -86.1581 },
        'seattle': { lat: 47.6062, lng: -122.3321 },
        'denver': { lat: 39.7392, lng: -104.9903 },
        'washington': { lat: 38.9072, lng: -77.0369 }
      }

      // Try to find city in address
      for (const [city, coords] of Object.entries(cityCoordinates)) {
        if (addressLower.includes(city)) {
          // Add some random variation to simulate different addresses
          return {
            lat: coords.lat + (Math.random() - 0.5) * 0.1,
            lng: coords.lng + (Math.random() - 0.5) * 0.1
          }
        }
      }

      // Default to New York if no city found
      return { lat: 40.7128, lng: -74.0060 }
    }

    const coordinates = mockGeocode(address)

    return NextResponse.json({
      success: true,
      coordinates,
      address,
      message: 'Address geocoded successfully'
    })

  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get nearby locations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const radius = parseFloat(searchParams.get('radius') || '10') // miles

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Mock nearby locations
    const nearbyLocations = [
      {
        id: 'loc_1',
        name: 'Downtown Area',
        address: '123 Main St, City, State 12345',
        coordinates: { lat: lat + 0.01, lng: lng + 0.01 },
        distance: 0.5
      },
      {
        id: 'loc_2',
        name: 'Shopping District',
        address: '456 Commerce Ave, City, State 12345',
        coordinates: { lat: lat - 0.02, lng: lng + 0.015 },
        distance: 1.2
      },
      {
        id: 'loc_3',
        name: 'Residential Area',
        address: '789 Oak St, City, State 12345',
        coordinates: { lat: lat + 0.025, lng: lng - 0.01 },
        distance: 2.1
      }
    ]

    return NextResponse.json({
      success: true,
      locations: nearbyLocations,
      center: { lat, lng },
      radius
    })

  } catch (error) {
    console.error('Get nearby locations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
