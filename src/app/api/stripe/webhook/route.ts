import { NextRequest, NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import { headers } from 'next/headers';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-08-27.basil',
// });

// const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Webhook functionality temporarily disabled' }, { status: 503 });
}

