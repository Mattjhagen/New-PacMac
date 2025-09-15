import { NextRequest, NextResponse } from 'next/server';
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-08-27.basil',
// });

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Payment functionality temporarily disabled' }, { status: 503 });
}
