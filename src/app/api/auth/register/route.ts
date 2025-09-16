import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { UserRegistration, User } from '@/types/User'

// In-memory storage for demo (replace with database in production)
const users: User[] = []

export async function POST(request: NextRequest) {
  try {
    const body: UserRegistration = await request.json()
    
    // Validate required fields
    if (!body.email || !body.username || !body.password || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === body.email || u.username === body.username)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email or username' },
        { status: 409 }
      )
    }

    // Hash password
    await bcrypt.hash(body.password, 12)

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: body.email,
      username: body.username,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      location: {
        ...body.location,
        coordinates: {
          lat: 0, // Will be geocoded
          lng: 0
        }
      },
      profile: {
        businessName: body.businessName,
        businessType: body.businessType || 'individual',
        verified: false,
        rating: 0,
        reviewCount: 0
      },
      preferences: {
        notifications: true,
        emailUpdates: true,
        smsUpdates: false,
        publicProfile: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }

    // Store user (in production, save to database)
    users.push(newUser)

    // Return user (password is not stored in the user object)
    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User registered successfully'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get all users (for admin purposes)
export async function GET() {
  try {
    // Return users without sensitive data
    const publicUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      profile: user.profile,
      createdAt: user.createdAt
    }))

    return NextResponse.json({
      success: true,
      users: publicUsers
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
