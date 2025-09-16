import { NextRequest, NextResponse } from 'next/server';

interface BankAccount {
  id: string;
  userId: string;
  name: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  verified: boolean;
  linkedAt: string;
  verifiedAt?: string;
}

interface DebitCard {
  id: string;
  userId: string;
  lastFour: string;
  brand: string;
  linkedAt: string;
  active: boolean;
}

// Mock database - in production, use a real database
let bankAccounts: BankAccount[] = [];
let debitCards: DebitCard[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userBankAccounts = bankAccounts.filter(account => account.userId === userId);
    const userDebitCards = debitCards.filter(card => card.userId === userId);

    return NextResponse.json({
      bankAccounts: userBankAccounts,
      debitCards: userDebitCards
    });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, accountNumber, routingNumber, accountType } = body;

    if (!userId || !name || !accountNumber || !routingNumber || !accountType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already has a bank account
    const existingAccount = bankAccounts.find(account => account.userId === userId);
    if (existingAccount) {
      return NextResponse.json({ error: 'User already has a linked bank account' }, { status: 400 });
    }

    // Create new bank account
    const newBankAccount: BankAccount = {
      id: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name,
      accountNumber: accountNumber.replace(/\d(?=\d{4})/g, '*'), // Mask account number
      routingNumber,
      accountType,
      verified: false,
      linkedAt: new Date().toISOString()
    };

    bankAccounts.push(newBankAccount);

    return NextResponse.json({
      success: true,
      bankAccount: newBankAccount
    });
  } catch (error) {
    console.error('Error creating bank account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, verified } = body;

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const accountIndex = bankAccounts.findIndex(account => account.id === accountId);
    if (accountIndex === -1) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    // Update account verification status
    bankAccounts[accountIndex] = {
      ...bankAccounts[accountIndex],
      verified: verified || false,
      verifiedAt: verified ? new Date().toISOString() : undefined
    };

    return NextResponse.json({
      success: true,
      bankAccount: bankAccounts[accountIndex]
    });
  } catch (error) {
    console.error('Error updating bank account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const accountIndex = bankAccounts.findIndex(account => account.id === accountId);
    if (accountIndex === -1) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    // Remove bank account
    bankAccounts.splice(accountIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
