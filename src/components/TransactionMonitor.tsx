'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  StarIcon,
  ShieldCheckIcon,
  MapPinIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

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

interface TransactionMonitorProps {
  userId: string;
  transactions: Transaction[];
  onTransactionUpdate: (transactionId: string, updates: Partial<Transaction>) => void;
}

export default function TransactionMonitor({ 
  userId, 
  transactions, 
  onTransactionUpdate 
}: TransactionMonitorProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'disputed' | 'chargeback'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Filter transactions based on current filter
  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.status === filter;
  });

  // Calculate transaction statistics
  const stats = {
    total: transactions.length,
    completed: transactions.filter(tx => tx.status === 'completed').length,
    pending: transactions.filter(tx => tx.status === 'pending').length,
    disputed: transactions.filter(tx => tx.status === 'disputed').length,
    chargebacks: transactions.filter(tx => tx.status === 'chargeback').length,
    successful: transactions.filter(tx => 
      tx.status === 'completed' && 
      tx.proximityVerified && 
      (!tx.userReviews.buyerReview || tx.userReviews.buyerReview.rating >= 4) &&
      (!tx.userReviews.sellerReview || tx.userReviews.sellerReview.rating >= 4) &&
      tx.chargebacks === 0 &&
      tx.disputes === 0
    ).length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'disputed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />;
      case 'chargeback':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'disputed':
        return 'bg-orange-100 text-orange-800';
      case 'chargeback':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isTransactionSuccessful = (tx: Transaction): boolean => {
    return tx.status === 'completed' && 
           tx.proximityVerified && 
           (!tx.userReviews.buyerReview || tx.userReviews.buyerReview.rating >= 4) &&
           (!tx.userReviews.sellerReview || tx.userReviews.sellerReview.rating >= 4) &&
           tx.chargebacks === 0 &&
           tx.disputes === 0;
  };

  const handleConfirmCompletion = (transactionId: string) => {
    onTransactionUpdate(transactionId, {
      completionConfirmed: {
        buyer: userId === transactions.find(tx => tx.id === transactionId)?.buyerId,
        seller: userId === transactions.find(tx => tx.id === transactionId)?.sellerId
      }
    });
  };

  const handleAddReview = (transactionId: string, rating: number, comment: string) => {
    const isBuyer = userId === transactions.find(tx => tx.id === transactionId)?.buyerId;
    const review = {
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    onTransactionUpdate(transactionId, {
      userReviews: {
        ...transactions.find(tx => tx.id === transactionId)?.userReviews,
        [isBuyer ? 'buyerReview' : 'sellerReview']: review
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Successful</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.successful}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Issues</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.disputed + stats.chargebacks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress to Debit Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Progress to Debit Card</h3>
          <span className="text-sm text-gray-500">{stats.successful}/5 successful transactions</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((stats.successful / 5) * 100, 100)}%` }}
          ></div>
        </div>
        {stats.successful >= 5 && (
          <p className="text-sm text-green-600 mt-2 font-medium">
            🎉 You can now link a debit card for instant credit!
          </p>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All', count: stats.total },
          { key: 'pending', label: 'Pending', count: stats.pending },
          { key: 'completed', label: 'Completed', count: stats.completed },
          { key: 'disputed', label: 'Disputed', count: stats.disputed },
          { key: 'chargeback', label: 'Chargeback', count: stats.chargebacks }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <div key={transaction.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(transaction.status)}
                  <h4 className="text-lg font-semibold text-gray-900">{transaction.productName}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold text-gray-900">${transaction.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-mono text-sm text-gray-600">{transaction.id.slice(0, 8)}...</p>
                  </div>
                </div>

                {/* Transaction Requirements Status */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className={`h-4 w-4 ${transaction.proximityVerified ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`text-sm ${transaction.proximityVerified ? 'text-green-600' : 'text-gray-500'}`}>
                      Proximity
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarIcon className={`h-4 w-4 ${transaction.userReviews.buyerReview && transaction.userReviews.buyerReview.rating >= 4 ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`text-sm ${transaction.userReviews.buyerReview && transaction.userReviews.buyerReview.rating >= 4 ? 'text-green-600' : 'text-gray-500'}`}>
                      Buyer Review
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarIcon className={`h-4 w-4 ${transaction.userReviews.sellerReview && transaction.userReviews.sellerReview.rating >= 4 ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`text-sm ${transaction.userReviews.sellerReview && transaction.userReviews.sellerReview.rating >= 4 ? 'text-green-600' : 'text-gray-500'}`}>
                      Seller Review
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className={`h-4 w-4 ${transaction.chargebacks === 0 && transaction.disputes === 0 ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-sm ${transaction.chargebacks === 0 && transaction.disputes === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      No Issues
                    </span>
                  </div>
                </div>

                {/* Success Indicator */}
                {isTransactionSuccessful(transaction) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        This transaction meets all requirements for successful completion
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {transaction.status === 'completed' && !transaction.completionConfirmed.buyer && !transaction.completionConfirmed.seller && (
                    <button
                      onClick={() => handleConfirmCompletion(transaction.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      Confirm Completion
                    </button>
                  )}
                  
                  {!transaction.userReviews.buyerReview && userId === transaction.buyerId && (
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Review
                    </button>
                  )}
                  
                  {!transaction.userReviews.sellerReview && userId === transaction.sellerId && (
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      className="text-2xl hover:text-yellow-400 transition-colors"
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle review submission
                  setSelectedTransaction(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
