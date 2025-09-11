import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // TODO: Update your database, send confirmation email, etc.
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
        
        // TODO: Handle failed payment (notify user, log error, etc.)
        await handlePaymentFailure(failedPayment);
        break;

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        
        // TODO: Handle successful checkout
        await handleCheckoutSuccess(session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  // TODO: Implement your business logic here
  // Examples:
  // - Update order status in database
  // - Send confirmation email
  // - Update inventory
  // - Create shipping label
  
  console.log('Processing successful payment:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata: paymentIntent.metadata,
  });
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  // TODO: Implement your business logic here
  // Examples:
  // - Notify user of payment failure
  // - Log error for investigation
  // - Restore inventory if needed
  
  console.log('Processing failed payment:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    last_payment_error: paymentIntent.last_payment_error,
  });
}

async function handleCheckoutSuccess(session: Stripe.Checkout.Session) {
  // TODO: Implement your business logic here
  // Examples:
  // - Create order record
  // - Send order confirmation
  // - Process fulfillment
  
  console.log('Processing successful checkout:', {
    id: session.id,
    amount_total: session.amount_total,
    currency: session.currency,
    customer_email: session.customer_email,
  });
}
