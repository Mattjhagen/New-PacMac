import { NextRequest, NextResponse } from 'next/server';

interface DebitCard {
  id: string;
  userId: string;
  lastFour: string;
  brand: string;
  linkedAt: string;
  active: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'disputed' | 'chargeback';
  buyerId: string;
  sellerId: string;
  productId: string;
  createdAt: string;
  completedAt?: string;
  proximityVerified: boolean;
  userReviews: {
    buyerReview?: { rating: number; comment: string };
    sellerReview?: { rating: number; comment: string };
  };
  chargebacks: number;
  disputes: number;
}

// Mock database - in production, use a real database
let debitCards: DebitCard[] = [];
let transactions: Transaction[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userDebitCards = debitCards.filter(card => card.userId === userId);

    return NextResponse.json({
      debitCards: userDebitCards
    });
  } catch (error) {
    console.error('Error fetching debit cards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = body;

    if (!userId || !cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already has a debit card
    const existingCard = debitCards.find(card => card.userId === userId);
    if (existingCard) {
      return NextResponse.json({ error: 'User already has a linked debit card' }, { status: 400 });
    }

    // Check if user has completed 5 successful transactions
    const userTransactions = transactions.filter(tx => 
      (tx.buyerId === userId || tx.sellerId === userId) &&
      tx.status === 'completed' && 
      tx.proximityVerified && 
      (!tx.userReviews.buyerReview || tx.userReviews.buyerReview.rating >= 4) &&
      (!tx.userReviews.sellerReview || tx.userReviews.sellerReview.rating >= 4) &&
      tx.chargebacks === 0 &&
      tx.disputes === 0
    );

    if (userTransactions.length < 5) {
      return NextResponse.json({ 
        error: 'Must complete 5 successful transactions before linking debit card',
        requiredTransactions: 5,
        completedTransactions: userTransactions.length
      }, { status: 400 });
    }

    // Determine card brand based on card number
    const getCardBrand = (cardNumber: string): string => {
      const number = cardNumber.replace(/\D/g, '');
      if (number.startsWith('4')) return 'Visa';
      if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
      if (number.startsWith('3')) return 'American Express';
      if (number.startsWith('6')) return 'Discover';
      return 'Unknown';
    };

    // Create new debit card
    const newDebitCard: DebitCard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      lastFour: cardNumber.slice(-4),
      brand: getCardBrand(cardNumber),
      linkedAt: new Date().toISOString(),
      active: true
    };

    debitCards.push(newDebitCard);

    return NextResponse.json({
      success: true,
      debitCard: newDebitCard
    });
  } catch (error) {
    console.error('Error creating debit card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, active } = body;

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const cardIndex = debitCards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
      return NextResponse.json({ error: 'Debit card not found' }, { status: 404 });
    }

    // Update card status
    debitCards[cardIndex] = {
      ...debitCards[cardIndex],
      active: active !== undefined ? active : debitCards[cardIndex].active
    };

    return NextResponse.json({
      success: true,
      debitCard: debitCards[cardIndex]
    });
  } catch (error) {
    console.error('Error updating debit card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const cardIndex = debitCards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
      return NextResponse.json({ error: 'Debit card not found' }, { status: 404 });
    }

    // Remove debit card
    debitCards.splice(cardIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting debit card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
