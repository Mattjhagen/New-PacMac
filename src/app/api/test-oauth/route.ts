import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasPublicGoogleClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
