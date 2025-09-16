import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

interface EscrowRequest {
  itemPrice: number;
  auctionId: string;
  buyerId: string;
  sellerId: string;
  productName: string;
}

interface EscrowFee {
  flatFee: number;
  percentageFee: number;
  totalEscrowFee: number;
  totalAmount: number;
  sellerAmount: number;
}

export async function POST(request: NextRequest) {
  try {
    const { itemPrice, auctionId, buyerId, sellerId, productName }: EscrowRequest = await request.json();

    // Validate input
    if (!itemPrice || !auctionId || !buyerId || !sellerId || !productName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate escrow fees
    const flatFee = 3.00; // $3 flat fee
    const percentageFee = itemPrice * 0.03; // 3% of item price
    const totalEscrowFee = flatFee + percentageFee;
    const totalAmount = itemPrice + totalEscrowFee;
    const sellerAmount = itemPrice; // Seller gets the original item price

    const escrowFee: EscrowFee = {
      flatFee,
      percentageFee,
      totalEscrowFee,
      totalAmount,
      sellerAmount
    };

    // Generate escrow ID
    const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        escrowId,
        auctionId,
        buyerId,
        sellerId,
        productName,
        itemPrice: itemPrice.toString(),
        escrowFee: totalEscrowFee.toString(),
        sellerAmount: sellerAmount.toString(),
        type: 'escrow_payment'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // In a real application, you would:
    // 1. Save escrow record to database
    // 2. Create escrow account for this transaction
    // 3. Set up automatic release conditions
    // 4. Send notifications to buyer and seller

    console.log('Escrow created:', {
      escrowId,
      auctionId,
      buyerId,
      sellerId,
      itemPrice,
      escrowFee: totalEscrowFee,
      totalAmount,
      sellerAmount,
      paymentIntentId: paymentIntent.id
    });

    return NextResponse.json({
      escrowId,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      escrowFee,
      status: 'created'
    });

  } catch (error) {
    console.error('Escrow creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create escrow' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const escrowId = searchParams.get('escrowId');

    if (!escrowId) {
      return NextResponse.json(
        { error: 'Escrow ID is required' },
        { status: 400 }
      );
    }

    // In a real application, you would fetch from database
    // For now, return mock data
    const mockEscrowData = {
      escrowId,
      status: 'pending',
      itemPrice: 2.50,
      escrowFee: 3.08, // $3 + 3% of $2.50
      totalAmount: 5.58,
      sellerAmount: 2.50,
      createdAt: new Date().toISOString(),
      auctionId: 'auction_123',
      buyerId: 'user_123',
      sellerId: 'seller_456'
    };

    return NextResponse.json(mockEscrowData);

  } catch (error) {
    console.error('Escrow fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch escrow' },
      { status: 500 }
    );
  }
}

// Update escrow status (for delivery confirmation, disputes, etc.)
export async function PUT(request: NextRequest) {
  try {
    const { escrowId, status, action } = await request.json();

    if (!escrowId || !status) {
      return NextResponse.json(
        { error: 'Escrow ID and status are required' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Update escrow record in database
    // 2. Process payment release if status is 'completed'
    // 3. Handle disputes if status is 'disputed'
    // 4. Send notifications to relevant parties

    console.log('Escrow status updated:', {
      escrowId,
      status,
      action,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      escrowId,
      status,
      updatedAt: new Date().toISOString(),
      message: 'Escrow status updated successfully'
    });

  } catch (error) {
    console.error('Escrow update error:', error);
    return NextResponse.json(
      { error: 'Failed to update escrow' },
      { status: 500 }
    );
  }
}
