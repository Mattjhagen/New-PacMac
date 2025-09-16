export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  phone?: string
  location: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  profile: {
    bio?: string
    avatar?: string
    businessName?: string
    businessType?: 'individual' | 'business' | 'retailer'
    verified: boolean
    rating: number
    reviewCount: number
  }
  preferences: {
    notifications: boolean
    emailUpdates: boolean
    smsUpdates: boolean
    publicProfile: boolean
  }
  createdAt: string
  updatedAt: string
  lastLoginAt: string
}

export interface UserRegistration {
  email: string
  username: string
  firstName: string
  lastName: string
  password: string
  phone?: string
  location: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  businessName?: string
  businessType?: 'individual' | 'business' | 'retailer'
}

export interface UserLogin {
  email: string
  password: string
}

export interface LocationData {
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface ProductListing {
  id: string
  userId: string
  product: {
    id: string
    name: string
    brand: string
    model: string
    price: number
    description: string
    images: string[]
    specs: Record<string, string | number | boolean>
    condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor'
    category: string
    tags: string[]
  }
  location: LocationData
  availability: {
    status: 'available' | 'pending' | 'sold'
    pickupOnly: boolean
    shippingAvailable: boolean
    localDelivery: boolean
    deliveryRadius: number // in miles
  }
  contact: {
    preferredMethod: 'email' | 'phone' | 'sms'
    responseTime: string
  }
  createdAt: string
  updatedAt: string
  expiresAt?: string
}
