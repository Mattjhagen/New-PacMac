'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  SignalIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface Location {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

interface ProximityVerificationProps {
  buyerLocation?: Location;
  sellerLocation?: Location;
  onProximityVerified: (verified: boolean, distance: number) => void;
  onLocationUpdate: (location: Location) => void;
  isActive: boolean;
}

export default function ProximityVerification({
  buyerLocation,
  sellerLocation,
  onProximityVerified,
  onLocationUpdate,
  isActive
}: ProximityVerificationProps) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Get current location
  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          resolve(location);
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  // Start location tracking
  const startLocationTracking = async () => {
    setIsTracking(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      onLocationUpdate(location);

      // Start continuous tracking
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          setCurrentLocation(newLocation);
          onLocationUpdate(newLocation);
        },
        (error) => {
          setError(`Location tracking error: ${error.message}`);
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 1000
        }
      );

      // Store watch ID for cleanup
      return () => navigator.geolocation.clearWatch(watchId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get location');
      setIsTracking(false);
    }
  };

  // Check proximity when both locations are available
  useEffect(() => {
    if (buyerLocation && sellerLocation && isActive) {
      const calculatedDistance = calculateDistance(
        buyerLocation.lat,
        buyerLocation.lng,
        sellerLocation.lat,
        sellerLocation.lng
      );
      
      setDistance(calculatedDistance);
      const verified = calculatedDistance <= 30.48; // 100 feet in meters
      setIsVerified(verified);
      onProximityVerified(verified, calculatedDistance);

      // Start countdown for verification
      if (verified) {
        setCountdown(30); // 30 seconds to confirm
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [buyerLocation, sellerLocation, isActive, onProximityVerified]);

  // Auto-start tracking when component becomes active
  useEffect(() => {
    if (isActive && !isTracking) {
      startLocationTracking();
    }
  }, [isActive]);

  const formatDistance = (meters: number): string => {
    if (meters < 1) {
      return `${Math.round(meters * 100)} cm`;
    } else if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };

  const getStatusColor = (): string => {
    if (!distance) return 'text-gray-500';
    if (distance <= 30.48) return 'text-green-600';
    if (distance <= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (!distance) return <SignalIcon className="h-5 w-5" />;
    if (distance <= 30.48) return <CheckCircleIcon className="h-5 w-5" />;
    if (distance <= 100) return <ExclamationTriangleIcon className="h-5 w-5" />;
    return <XCircleIcon className="h-5 w-5" />;
  };

  const getStatusText = (): string => {
    if (!distance) return 'Calculating distance...';
    if (distance <= 30.48) return 'Within range (100 feet)';
    if (distance <= 100) return 'Close to range';
    return 'Too far away';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2" />
          Proximity Verification
        </h3>
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {/* Location Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <UserIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Your Location</span>
          </div>
          {currentLocation ? (
            <div className="text-sm text-gray-600">
              <div>Lat: {currentLocation.lat.toFixed(6)}</div>
              <div>Lng: {currentLocation.lng.toFixed(6)}</div>
              <div>Accuracy: ±{Math.round(currentLocation.accuracy)}m</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {isTracking ? 'Getting location...' : 'Location not available'}
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <GlobeAltIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Other Party</span>
          </div>
          {buyerLocation || sellerLocation ? (
            <div className="text-sm text-gray-600">
              <div>Location shared</div>
              <div>Ready for verification</div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Waiting for location...</div>
          )}
        </div>
      </div>

      {/* Distance Display */}
      {distance !== null && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Distance</h4>
              <p className="text-2xl font-bold text-blue-600">{formatDistance(distance)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">Required: ≤ 100 feet</p>
              <p className="text-sm text-blue-700">(30.48 meters)</p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Status */}
      {isVerified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">Proximity Verified!</h4>
              <p className="text-sm text-green-700">
                You are within 100 feet of the other party. Complete the transaction to finalize.
              </p>
            </div>
          </div>
          {countdown > 0 && (
            <div className="mt-3 flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                Verification expires in {countdown} seconds
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-medium text-red-900">Location Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!isTracking && (
          <button
            onClick={startLocationTracking}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <MapPinIcon className="h-4 w-4 mr-2" />
            Start Location Tracking
          </button>
        )}
        
        {isTracking && (
          <button
            onClick={() => setIsTracking(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Stop Tracking
          </button>
        )}

        {isVerified && (
          <button
            onClick={() => onProximityVerified(true, distance || 0)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Confirm Transaction
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Instructions:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Both parties must be within 100 feet of each other</li>
          <li>• Location tracking must be enabled and accurate</li>
          <li>• Complete the transaction within the verification window</li>
          <li>• Both parties must confirm completion for successful transaction</li>
        </ul>
      </div>
    </div>
  );
}
