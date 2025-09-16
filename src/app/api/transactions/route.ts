import { NextRequest, NextResponse } from 'next/server';

interface Transaction {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'disputed' | 'chargeback';
  buyerId: string;
  sellerId: string;
  productId: string;
  productName: string;
  createdAt: string;
  completedAt?: string;
  proximityVerified: boolean;
  userReviews: {
    buyerReview?: { rating: number; comment: string; createdAt: string };
    sellerReview?: { rating: number; comment: string; createdAt: string };
  };
  chargebacks: number;
  disputes: number;
  completionConfirmed: {
    buyer: boolean;
    seller: boolean;
  };
  locations: {
    buyer: { lat: number; lng: number; timestamp: number };
    seller: { lat: number; lng: number; timestamp: number };
  };
}

// Mock database - in production, use a real database
let transactions: Transaction[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let filteredTransactions = transactions;

    if (userId) {
      filteredTransactions = transactions.filter(tx => 
        tx.buyerId === userId || tx.sellerId === userId
      );
    }

    if (status) {
      filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
    }

    return NextResponse.json(filteredTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      amount, 
      buyerId, 
      sellerId, 
      productId, 
      productName,
      buyerLocation,
      sellerLocation 
    } = body;

    if (!amount || !buyerId || !sellerId || !productId || !productName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate distance between buyer and seller
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

    const proximityVerified = buyerLocation && sellerLocation ? 
      calculateDistance(buyerLocation.lat, buyerLocation.lng, sellerLocation.lat, sellerLocation.lng) <= 30.48 : // 100 feet
      false;

    // Create new transaction
    const newTransaction: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      status: 'pending',
      buyerId,
      sellerId,
      productId,
      productName,
      createdAt: new Date().toISOString(),
      proximityVerified,
      userReviews: {},
      chargebacks: 0,
      disputes: 0,
      completionConfirmed: {
        buyer: false,
        seller: false
      },
      locations: {
        buyer: buyerLocation || { lat: 0, lng: 0, timestamp: Date.now() },
        seller: sellerLocation || { lat: 0, lng: 0, timestamp: Date.now() }
      }
    };

    transactions.push(newTransaction);

    return NextResponse.json({
      success: true,
      transaction: newTransaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, updates } = body;

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const transactionIndex = transactions.findIndex(tx => tx.id === transactionId);
    if (transactionIndex === -1) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Update transaction
    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      ...updates,
      completedAt: updates.status === 'completed' ? new Date().toISOString() : transactions[transactionIndex].completedAt
    };

    return NextResponse.json({
      success: true,
      transaction: transactions[transactionIndex]
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const transactionIndex = transactions.findIndex(tx => tx.id === transactionId);
    if (transactionIndex === -1) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Remove transaction
    transactions.splice(transactionIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
