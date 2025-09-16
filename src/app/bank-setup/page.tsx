'use client';

import React, { useState, useEffect } from 'react';
import { 
  BuildingLibraryIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import BankAccountLinking from '@/components/BankAccountLinking';
import TransactionMonitor from '@/components/TransactionMonitor';
import ProximityVerification from '@/components/ProximityVerification';

interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  verified: boolean;
  linkedAt: string;
}

interface DebitCard {
  id: string;
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
}

export default function BankSetupPage() {
  const [currentStep, setCurrentStep] = useState<'bank' | 'transactions' | 'proximity'>('bank');
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [debitCard, setDebitCard] = useState<DebitCard | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState('demo-user'); // In real app, get from auth context

  // Fetch user's bank accounts and transactions
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch bank accounts
        const bankResponse = await fetch(`/api/bank-accounts?userId=${userId}`);
        if (bankResponse.ok) {
          const bankData = await bankResponse.json();
          if (bankData.bankAccounts.length > 0) {
            setBankAccount(bankData.bankAccounts[0]);
          }
          if (bankData.debitCards.length > 0) {
            setDebitCard(bankData.debitCards[0]);
          }
        }

        // Fetch transactions
        const txResponse = await fetch(`/api/transactions?userId=${userId}`);
        if (txResponse.ok) {
          const txData = await txResponse.json();
          setTransactions(txData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleBankLinked = (newBankAccount: BankAccount) => {
    setBankAccount(newBankAccount);
    setCurrentStep('transactions');
  };

  const handleDebitCardLinked = () => {
    // Refresh debit card data
    const fetchDebitCards = async () => {
      try {
        const response = await fetch(`/api/debit-cards?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.debitCards.length > 0) {
            setDebitCard(data.debitCards[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching debit cards:', error);
      }
    };
    fetchDebitCards();
  };

  const handleTransactionUpdate = async (transactionId: string, updates: Partial<Transaction>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          updates
        }),
      });

      if (response.ok) {
        // Refresh transactions
        const txResponse = await fetch(`/api/transactions?userId=${userId}`);
        if (txResponse.ok) {
          const txData = await txResponse.json();
          setTransactions(txData);
        }
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Marketplace
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bank & Payment Setup</h1>
                <p className="text-gray-600">Link your accounts and manage transactions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center space-x-2 ${currentStep === 'bank' ? 'text-blue-600' : bankAccount ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'bank' ? 'bg-blue-600 text-white' : bankAccount ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {bankAccount ? <CheckCircleIcon className="h-5 w-5" /> : <BuildingLibraryIcon className="h-5 w-5" />}
              </div>
              <span className="font-medium">Bank Account</span>
            </div>
            
            <div className={`flex-1 h-0.5 ${bankAccount ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center space-x-2 ${currentStep === 'transactions' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'transactions' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                <CreditCardIcon className="h-5 w-5" />
              </div>
              <span className="font-medium">Transactions</span>
            </div>
            
            <div className={`flex-1 h-0.5 ${debitCard ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center space-x-2 ${currentStep === 'proximity' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'proximity' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                <CheckCircleIcon className="h-5 w-5" />
              </div>
              <span className="font-medium">Proximity</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'bank' && (
            <BankAccountLinking
              userId={userId}
              onBankLinked={handleBankLinked}
              onDebitCardLinked={handleDebitCardLinked}
              currentTransactions={transactions}
            />
          )}

          {currentStep === 'transactions' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Management</h2>
                <p className="text-gray-600 mb-6">
                  Monitor your transactions and ensure they meet our quality standards for successful completion.
                </p>
                <button
                  onClick={() => setCurrentStep('proximity')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test Proximity Verification
                </button>
              </div>
              
              <TransactionMonitor
                userId={userId}
                transactions={transactions}
                onTransactionUpdate={handleTransactionUpdate}
              />
            </div>
          )}

          {currentStep === 'proximity' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Proximity Verification</h2>
                <p className="text-gray-600 mb-6">
                  Test the GPS proximity verification system that ensures both parties are within 100 feet of each other.
                </p>
              </div>
              
              <ProximityVerification
                buyerLocation={undefined}
                sellerLocation={undefined}
                onProximityVerified={(verified, distance) => {
                  console.log('Proximity verified:', verified, 'Distance:', distance);
                }}
                onLocationUpdate={(location) => {
                  console.log('Location updated:', location);
                }}
                isActive={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
