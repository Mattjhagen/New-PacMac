'use client';

import { useState, useEffect } from 'react';
import { ClockIcon, CurrencyDollarIcon, UserIcon } from '@heroicons/react/24/outline';

interface Bid {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: string;
  isWinning: boolean;
}

interface Auction {
  id: string;
  productId: string;
  startingPrice: number;
  currentBid: number;
  bidCount: number;
  startTime: string;
  endTime: string;
  status: 'active' | 'ended' | 'cancelled';
  winnerId?: string;
  bids: Bid[];
}

interface AuctionSystemProps {
  auction: Auction;
  currentUserId: string;
  onBid: (amount: number) => void;
  onWin: (auction: Auction) => void;
}

export default function AuctionSystem({ auction, currentUserId, onBid, onWin }: AuctionSystemProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [bidAmount, setBidAmount] = useState(0.05);
  const [isBidding, setIsBidding] = useState(false);

  // Calculate time remaining
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(auction.endTime).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining('Auction Ended');
        if (auction.status === 'active') {
          onWin(auction);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime, auction.status, onWin]);

  const handleBid = async () => {
    if (isBidding) return;
    
    setIsBidding(true);
    try {
      await onBid(bidAmount);
      setBidAmount(0.05); // Reset to minimum bid
    } catch (error) {
      console.error('Bid failed:', error);
    } finally {
      setIsBidding(false);
    }
  };

  const isWinning = auction.bids.some(bid => bid.userId === currentUserId && bid.isWinning);
  const userBidCount = auction.bids.filter(bid => bid.userId === currentUserId).length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Auction Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Live Auction</h3>
          <p className="text-sm text-gray-600">Auction #{auction.id}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center text-red-600 mb-1">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{timeRemaining}</span>
          </div>
          <div className="text-xs text-gray-500">
            {auction.bidCount} bids
          </div>
        </div>
      </div>

      {/* Current Bid */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Current Bid</p>
            <p className="text-2xl font-bold text-green-600">
              ${auction.currentBid.toFixed(2)}
            </p>
          </div>
          {isWinning && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              You're Winning!
            </div>
          )}
        </div>
      </div>

      {/* Bid Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Bid
        </label>
        <div className="flex space-x-2 mb-3">
          <button
            onClick={() => setBidAmount(0.05)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              bidAmount === 0.05 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            $0.05
          </button>
          <button
            onClick={() => setBidAmount(0.10)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              bidAmount === 0.10 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            $0.10
          </button>
          <button
            onClick={() => setBidAmount(0.25)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              bidAmount === 0.25 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            $0.25
          </button>
          <button
            onClick={() => setBidAmount(0.50)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              bidAmount === 0.50 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            $0.50
          </button>
        </div>
        
        <div className="flex space-x-2">
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0.05)}
            min="0.05"
            step="0.05"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleBid}
            disabled={isBidding || bidAmount < 0.05}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBidding ? 'Bidding...' : 'Bid'}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-1">
          Your bid will be: ${(auction.currentBid + bidAmount).toFixed(2)}
        </p>
      </div>

      {/* Recent Bids */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Bids</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {auction.bids.slice(-5).reverse().map((bid) => (
            <div
              key={bid.id}
              className={`flex justify-between items-center p-2 rounded ${
                bid.userId === currentUserId ? 'bg-blue-50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">
                  {bid.userId === currentUserId ? 'You' : bid.userName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">
                  ${bid.amount.toFixed(2)}
                </span>
                {bid.isWinning && (
                  <div className="text-xs text-green-600">Winning</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Stats */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Your bids:</span>
          <span className="font-medium">{userBidCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`font-medium ${isWinning ? 'text-green-600' : 'text-gray-600'}`}>
            {isWinning ? 'Winning' : 'Outbid'}
          </span>
        </div>
      </div>
    </div>
  );
}
