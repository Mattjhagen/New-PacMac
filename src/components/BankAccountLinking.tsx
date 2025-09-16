'use client';

import React, { useState, useEffect } from 'react';
import { 
  BuildingLibraryIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  verified: boolean;
  linkedAt: string;
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

interface BankAccountLinkingProps {
  userId: string;
  onBankLinked: (bankAccount: BankAccount) => void;
  onDebitCardLinked: () => void;
  currentTransactions: Transaction[];
}

export default function BankAccountLinking({ 
  userId, 
  onBankLinked, 
  onDebitCardLinked,
  currentTransactions 
}: BankAccountLinkingProps) {
  const [step, setStep] = useState<'intro' | 'linking' | 'verification' | 'success' | 'debit-card'>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [successfulTransactions, setSuccessfulTransactions] = useState(0);
  const [canLinkDebitCard, setCanLinkDebitCard] = useState(false);

  // Calculate successful transactions
  useEffect(() => {
    const successful = currentTransactions.filter(tx => 
      tx.status === 'completed' && 
      tx.proximityVerified && 
      (!tx.userReviews.buyerReview || tx.userReviews.buyerReview.rating >= 4) &&
      (!tx.userReviews.sellerReview || tx.userReviews.sellerReview.rating >= 4) &&
      tx.chargebacks === 0 &&
      tx.disputes === 0
    ).length;
    
    setSuccessfulTransactions(successful);
    setCanLinkDebitCard(successful >= 5);
  }, [currentTransactions]);

  const handleBankLinking = async () => {
    setIsLoading(true);
    setError(null);
    setStep('linking');

    try {
      // Simulate Plaid Link integration
      // In a real implementation, you would use Plaid Link
      const mockBankAccount: BankAccount = {
        id: `bank_${Date.now()}`,
        name: 'Chase Checking',
        accountNumber: '****1234',
        routingNumber: '021000021',
        accountType: 'checking',
        verified: false,
        linkedAt: new Date().toISOString()
      };

      // Simulate verification process
      setTimeout(() => {
        setBankAccount(mockBankAccount);
        setStep('verification');
        setIsLoading(false);
      }, 2000);

    } catch (error) {
      setError('Failed to link bank account. Please try again.');
      setIsLoading(false);
      setStep('intro');
    }
  };

  const handleVerification = async () => {
    setIsLoading(true);
    
    try {
      // Simulate micro-deposits verification
      setTimeout(() => {
        if (bankAccount) {
          const verifiedAccount = { ...bankAccount, verified: true };
          setBankAccount(verifiedAccount);
          onBankLinked(verifiedAccount);
          setStep('success');
        }
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      setError('Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDebitCardLinking = async () => {
    setIsLoading(true);
    
    try {
      // Simulate debit card linking
      setTimeout(() => {
        onDebitCardLinked();
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      setError('Failed to link debit card. Please try again.');
      setIsLoading(false);
    }
  };

  // Intro step
  if (step === 'intro') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BuildingLibraryIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Link Your Bank Account</h2>
            <p className="text-gray-600">Secure, fast, and reliable payment processing</p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Instant Payments</h4>
                <p className="text-sm text-gray-600">Receive payments immediately after successful transactions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Bank-Level Security</h4>
                <p className="text-sm text-gray-600">256-bit encryption and fraud protection</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
              <MapPinIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Proximity Verification</h4>
                <p className="text-sm text-gray-600">GPS verification for secure transactions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
              <ClockIcon className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Quick Setup</h4>
                <p className="text-sm text-gray-600">Link your account in under 2 minutes</p>
              </div>
            </div>
          </div>

          {/* Transaction Requirements */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Transaction Requirements</h4>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• No chargebacks or disputes</li>
                  <li>• Positive user reviews (4+ stars)</li>
                  <li>• GPS proximity verification (within 100 feet)</li>
                  <li>• Both parties must confirm completion</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Successful Transactions</span>
              <span className="text-sm text-gray-500">{successfulTransactions}/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(successfulTransactions / 5) * 100}%` }}
              ></div>
            </div>
            {successfulTransactions >= 5 && (
              <p className="text-sm text-green-600 mt-2 font-medium">
                🎉 You can now link a debit card for instant credit!
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleBankLinking}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <BuildingLibraryIcon className="h-5 w-5 mr-2" />
              Link Bank Account
            </button>
            {canLinkDebitCard && (
              <button
                onClick={() => setStep('debit-card')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Link Debit Card
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Linking step
  if (step === 'linking') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BuildingLibraryIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Linking Your Bank Account</h2>
            <p className="text-gray-600 mb-6">Please wait while we securely connect to your bank...</p>
            
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  // Verification step
  if (step === 'verification') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Account</h2>
            <p className="text-gray-600">We need to verify your bank account ownership</p>
          </div>

          {bankAccount && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Account Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-medium">{bankAccount.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account:</span>
                  <span className="font-medium">{bankAccount.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{bankAccount.accountType}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">Verification Process</h4>
                <p className="text-sm text-blue-700 mt-1">
                  We'll make two small deposits to your account (less than $1 each). 
                  Check your bank statement and enter the amounts to verify ownership.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleVerification}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Verify Account
                </>
              )}
            </button>
            <button
              onClick={() => setStep('intro')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success step
  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bank Account Linked!</h2>
            <p className="text-gray-600">Your account has been successfully verified and linked</p>
          </div>

          {bankAccount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-800">Account Verified</h4>
                  <p className="text-sm text-green-700">
                    {bankAccount.name} • {bankAccount.accountNumber}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">Next Steps</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Complete 5 successful transactions to unlock debit card linking</li>
              <li>• Ensure all transactions meet our quality standards</li>
              <li>• Maintain positive user reviews and ratings</li>
              <li>• Use GPS proximity verification for all transactions</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setStep('intro')}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              <ArrowRightIcon className="h-5 w-5 mr-2" />
              Continue to Marketplace
            </button>
            {canLinkDebitCard && (
              <button
                onClick={() => setStep('debit-card')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Link Debit Card
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Debit card step
  if (step === 'debit-card') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCardIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Debit Card</h2>
            <p className="text-gray-600">Get instant credit up to 15 minutes after transaction completion</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Eligibility Confirmed</h4>
                <p className="text-sm text-green-700">
                  You've completed {successfulTransactions} successful transactions
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Instant Credit</h4>
                <p className="text-sm text-gray-600">Available up to 15 minutes after completion</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Secure Processing</h4>
                <p className="text-sm text-gray-600">Bank-level security and fraud protection</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDebitCardLinking}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Linking...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Link Debit Card
                </>
              )}
            </button>
            <button
              onClick={() => setStep('intro')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
