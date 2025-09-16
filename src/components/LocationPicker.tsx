'use client'

import { useState } from 'react'
import { LocationData } from '@/types/User'

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void
  onCancel: () => void
  initialLocation?: LocationData
}

export default function LocationPicker({ onLocationSelect, onCancel, initialLocation }: LocationPickerProps) {
  const [location, setLocation] = useState<LocationData>(initialLocation || {
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    coordinates: { lat: 0, lng: 0 }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)

  const handleInputChange = (field: keyof LocationData, value: string) => {
    setLocation(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCoordinatesChange = (field: 'lat' | 'lng', value: number) => {
    setLocation(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [field]: value
      }
    }))
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation(prev => ({
          ...prev,
          coordinates: { lat: latitude, lng: longitude }
        }))
        setLoading(false)
      },
      (err) => {
        console.error('Geolocation error:', err)
        setError('Unable to retrieve your location. Please enter it manually.')
        setLoading(false)
      }
    )
  }

  const geocodeAddress = async () => {
    if (!location.address || !location.city || !location.state) {
      setError('Please enter a complete address to geocode.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zipCode}`
      const response = await fetch('/api/location/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: fullAddress }),
      })

      const result = await response.json()

      if (result.success) {
        setLocation(prev => ({
          ...prev,
          coordinates: result.coordinates
        }))
      } else {
        setError(result.error || 'Failed to geocode address')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!location.address || !location.city || !location.state || !location.zipCode) {
      setError('Please fill in all required fields.')
      return
    }

    onLocationSelect(location)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Set Your Location</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Current Location Button */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Use Current Location</h3>
              <p className="text-sm text-blue-700">Automatically detect your location</p>
            </div>
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Detecting...' : 'Detect'}
            </button>
          </div>

          {/* Manual Address Entry */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Or Enter Address Manually</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={location.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={location.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="New York"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={location.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="NY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={location.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={location.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>

            {/* Geocode Button */}
            <button
              onClick={geocodeAddress}
              disabled={loading || !location.address || !location.city || !location.state}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Getting Coordinates...' : 'Get Coordinates from Address'}
            </button>
          </div>

          {/* Coordinates Display */}
          {(location.coordinates.lat !== 0 || location.coordinates.lng !== 0) && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">Coordinates</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-green-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={location.coordinates.lat}
                    onChange={(e) => handleCoordinatesChange('lat', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 text-sm border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-green-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={location.coordinates.lng}
                    onChange={(e) => handleCoordinatesChange('lng', parseFloat(e.target.value))}
                    className="w-full px-2 py-1 text-sm border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!location.address || !location.city || !location.state || !location.zipCode}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Location
          </button>
        </div>
      </div>
    </div>
  )
}
