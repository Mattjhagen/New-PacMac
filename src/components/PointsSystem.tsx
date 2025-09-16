'use client';

import { useState, useEffect } from 'react';
import { HeartIcon, CurrencyDollarIcon, TrophyIcon, GiftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  totalSpent: number;
  totalEarned: number;
  successfulTransactions: number;
  rating: number;
  joinDate: string;
}

interface Transaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  timestamp: string;
  relatedAuction?: string;
}

interface PointsSystemProps {
  user: User;
  transactions: Transaction[];
  onPointsUpdate: (newPoints: number) => void;
}

export default function PointsSystem({ user, transactions, onPointsUpdate }: PointsSystemProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  // Calculate points from successful transactions
  const calculateEarnedPoints = () => {
    return user.successfulTransactions * 10; // 10 points per successful transaction
  };

  const recentTransactions = transactions.slice(0, 5);
  const totalEarned = calculateEarnedPoints();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Points Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mb-4">
          <HeartSolidIcon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Points</h3>
        <div className="text-4xl font-bold text-pink-600 mb-2">{user.points}</div>
        <p className="text-gray-600">Available for bidding</p>
      </div>

      {/* Points Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{totalEarned}</div>
          <div className="text-sm text-gray-600">Points Earned</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{user.successfulTransactions}</div>
          <div className="text-sm text-gray-600">Successful Sales</div>
        </div>
      </div>

      {/* How Points Work */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <GiftIcon className="h-5 w-5 mr-2" />
          How Points Work
        </h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span>Earn 10 points for each successful sale</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span>Use 1 point = $1 in bidding</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            <span>Points never expire</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => setShowHistory(true)}
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 flex items-center justify-center"
        >
          <TrophyIcon className="h-5 w-5 mr-2" />
          View Transaction History
        </button>
        
        <button
          onClick={() => setShowRewards(true)}
          className="w-full bg-pink-100 text-pink-700 py-3 px-4 rounded-lg font-semibold hover:bg-pink-200 flex items-center justify-center"
        >
          <GiftIcon className="h-5 w-5 mr-2" />
          View Rewards
        </button>
      </div>

      {/* Transaction History Modal */}
      {showHistory && (
        <TransactionHistoryModal
          transactions={transactions}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Rewards Modal */}
      {showRewards && (
        <RewardsModal
          userPoints={user.points}
          onClose={() => setShowRewards(false)}
        />
      )}
    </div>
  );
}

// Transaction History Modal
interface TransactionHistoryModalProps {
  transactions: Transaction[];
  onClose: () => void;
}

function TransactionHistoryModal({ transactions, onClose }: TransactionHistoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-96 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <TrophyIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'earn' ? '+' : '-'}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Rewards Modal
interface RewardsModalProps {
  userPoints: number;
  onClose: () => void;
}

function RewardsModal({ userPoints, onClose }: RewardsModalProps) {
  const rewards = [
    {
      id: 1,
      name: 'Bid Boost',
      description: 'Use 1 point = $1 in bidding',
      cost: 1,
      available: true
    },
    {
      id: 2,
      name: 'Priority Listing',
      description: 'Get your items seen first',
      cost: 5,
      available: userPoints >= 5
    },
    {
      id: 3,
      name: 'Featured Auction',
      description: 'Highlight your auction for 24 hours',
      cost: 10,
      available: userPoints >= 10
    },
    {
      id: 4,
      name: 'Super Bid',
      description: 'Use 5 points = $5 in bidding',
      cost: 5,
      available: userPoints >= 5
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-96 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Available Rewards</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`p-4 rounded-lg border-2 ${
                  reward.available
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{reward.name}</h4>
                    <p className="text-sm text-gray-600">{reward.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <HeartSolidIcon className="h-4 w-4 text-pink-500 mr-1" />
                      <span className="font-semibold text-gray-900">{reward.cost}</span>
                    </div>
                    {!reward.available && (
                      <p className="text-xs text-gray-500">Not enough points</p>
                    )}
                  </div>
                </div>
                {reward.available && (
                  <button className="w-full mt-3 bg-pink-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-pink-700">
                    Use Reward
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
