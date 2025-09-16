'use client';

import { useState, useEffect, useRef } from 'react';
import { HeartIcon, XMarkIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  description: string;
  imageUrl?: string;
  img: string;
  tags: string[];
  specs: {
    display?: string;
    processor?: string;
    memory?: string;
    storage?: string;
    camera?: string;
    battery?: string;
    os?: string;
    color?: string;
    carrier?: string;
    lockStatus?: string;
    grade?: string;
  };
  inStock: boolean;
  stockCount: number;
  category: string;
  createdAt: string;
  updatedAt: string;
  // Auction properties
  auctionEndTime?: string;
  currentBid?: number;
  bidCount?: number;
  startingPrice?: number;
}

interface TinderMarketplaceProps {
  products: Product[];
  userPoints?: number;
  onSwipeLeft: (product: Product) => void;
  onSwipeRight: (product: Product) => void;
  onSwipeUp: (product: Product) => void;
  onSwipeDown: (product: Product) => void;
  onBid: (product: Product, amount: number, usePoints?: boolean) => void;
}

export default function TinderMarketplace({
  products,
  userPoints = 0,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onBid
}: TinderMarketplaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);

  const currentProduct = products[currentIndex];

  // Calculate time remaining for auction
  useEffect(() => {
    if (!currentProduct?.auctionEndTime) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(currentProduct.auctionEndTime!).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining('Auction Ended');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentProduct?.auctionEndTime]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isAnimating) return;
    currentX.current = e.touches[0].clientX;
    currentY.current = e.touches[0].clientY;
    
    const deltaX = currentX.current - startX.current;
    const deltaY = currentY.current - startY.current;
    
    if (cardRef.current) {
      const rotation = deltaX * 0.1;
      cardRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
      
      // Change opacity based on swipe distance
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const opacity = Math.max(0.3, 1 - distance / 300);
      cardRef.current.style.opacity = opacity.toString();
    }
  };

  const handleTouchEnd = () => {
    if (isAnimating || !currentProduct) return;
    
    const deltaX = currentX.current - startX.current;
    const deltaY = currentY.current - startY.current;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > 100) {
      setIsAnimating(true);
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          setSwipeDirection('right');
          setTimeout(() => {
            onSwipeRight(currentProduct);
            nextCard();
          }, 300);
        } else {
          setSwipeDirection('left');
          setTimeout(() => {
            onSwipeLeft(currentProduct);
            nextCard();
          }, 300);
        }
      } else {
        // Vertical swipe
        if (deltaY < 0) {
          setSwipeDirection('up');
          setTimeout(() => {
            onSwipeUp(currentProduct);
            nextCard();
          }, 300);
        } else {
          setSwipeDirection('down');
          setTimeout(() => {
            onSwipeDown(currentProduct);
            nextCard();
          }, 300);
        }
      }
    } else {
      // Reset card position
      if (cardRef.current) {
        cardRef.current.style.transform = 'translate(0px, 0px) rotate(0deg)';
        cardRef.current.style.opacity = '1';
      }
    }
  };

  const nextCard = () => {
    setCurrentIndex(prev => prev + 1);
    setIsAnimating(false);
    setSwipeDirection(null);
    if (cardRef.current) {
      cardRef.current.style.transform = 'translate(0px, 0px) rotate(0deg)';
      cardRef.current.style.opacity = '1';
    }
  };

  const handleAction = (action: 'left' | 'right' | 'up' | 'down' | 'bid') => {
    if (isAnimating || !currentProduct) return;
    
    if (action === 'bid') {
      setSelectedProduct(currentProduct);
      setShowBidModal(true);
      return;
    }
    
    setIsAnimating(true);
    setSwipeDirection(action);
    
    setTimeout(() => {
      switch (action) {
        case 'left':
          onSwipeLeft(currentProduct);
          break;
        case 'right':
          onSwipeRight(currentProduct);
          break;
        case 'up':
          onSwipeUp(currentProduct);
          break;
        case 'down':
          onSwipeDown(currentProduct);
          break;
      }
      nextCard();
    }, 300);
  };

  const handleBid = (amount: number, usePoints: boolean = false) => {
    if (selectedProduct) {
      onBid(selectedProduct, amount, usePoints);
      setShowBidModal(false);
      setSelectedProduct(null);
    }
  };

  if (!currentProduct) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
          <p className="text-gray-600 mb-6">You&apos;ve seen all available products.</p>
          <button 
            onClick={() => setCurrentIndex(0)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      {/* Header */}
      <div className="w-full max-w-sm mb-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {currentIndex + 1} of {products.length}
          </div>
          <div className="flex items-center space-x-2">
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
            <span className="text-sm font-semibold">{userPoints}</span>
          </div>
        </div>
      </div>

      {/* Product Card */}
      <div className="relative w-full max-w-sm h-96 mb-8">
        <div
          ref={cardRef}
          className={`absolute inset-0 bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
            isAnimating ? 'pointer-events-none' : ''
          } ${
            swipeDirection === 'left' ? 'animate-pulse' :
            swipeDirection === 'right' ? 'animate-pulse' :
            swipeDirection === 'up' ? 'animate-pulse' :
            swipeDirection === 'down' ? 'animate-pulse' : ''
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Product Image */}
          <div className="h-48 bg-gray-200 relative">
            {currentProduct.imageUrl ? (
              <img
                src={currentProduct.imageUrl}
                alt={currentProduct.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm">No image</p>
                </div>
              </div>
            )}
            
            {/* Auction Timer */}
            {currentProduct.auctionEndTime && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {timeRemaining}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentProduct.name}
              </h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  ${(currentProduct.currentBid || currentProduct.startingPrice || 0.99).toFixed(2)}
                </div>
                {currentProduct.bidCount && (
                  <div className="text-xs text-gray-500">
                    {currentProduct.bidCount} bids
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              {currentProduct.brand} {currentProduct.model}
            </p>
            
            {currentProduct.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {currentProduct.description}
              </p>
            )}

            {/* Key Specs */}
            <div className="space-y-1">
              {currentProduct.specs?.display && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Display:</span> {currentProduct.specs.display}
                </p>
              )}
              {currentProduct.specs?.storage && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Storage:</span> {currentProduct.specs.storage}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-8">
        <button
          onClick={() => handleAction('left')}
          disabled={isAnimating}
          className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors disabled:opacity-50"
        >
          <XMarkIcon className="h-8 w-8 text-red-600" />
        </button>
        
        <button
          onClick={() => handleAction('bid')}
          disabled={isAnimating}
          className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors disabled:opacity-50"
        >
          <HeartIcon className="h-8 w-8 text-purple-600" />
        </button>
        
        <button
          onClick={() => handleAction('right')}
          disabled={isAnimating}
          className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors disabled:opacity-50"
        >
          <CheckIcon className="h-8 w-8 text-green-600" />
        </button>
      </div>

      {/* Swipe Instructions */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Swipe left to pass • Swipe right to bid 5¢ • Swipe up to save • Swipe down to see less</p>
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedProduct && (
        <BidModal
          product={selectedProduct}
          userPoints={userPoints}
          onBid={handleBid}
          onClose={() => setShowBidModal(false)}
        />
      )}
    </div>
  );
}

// Bid Modal Component
interface BidModalProps {
  product: Product;
  userPoints: number;
  onBid: (amount: number, usePoints: boolean) => void;
  onClose: () => void;
}

function BidModal({ product, userPoints, onBid, onClose }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState(0.05);
  const [usePoints, setUsePoints] = useState(false);

  const handleBid = () => {
    onBid(bidAmount, usePoints);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Place a Bid</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Current bid: ${(product.currentBid || product.startingPrice || 0.99).toFixed(2)}</p>
          <p className="text-sm text-gray-600 mb-4">Your bid will be: ${(product.currentBid || product.startingPrice || 0.99) + bidAmount}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bid Amount
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setBidAmount(0.05)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  bidAmount === 0.05 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                $0.05
              </button>
              <button
                onClick={() => setBidAmount(1.00)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  bidAmount === 1.00 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                $1.00
              </button>
            </div>
          </div>

          {userPoints > 0 && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="usePoints"
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="usePoints" className="text-sm text-gray-700">
                Use {bidAmount === 1.00 ? '1' : '5'} points (${bidAmount} value)
              </label>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBid}
              disabled={usePoints && userPoints < (bidAmount === 1.00 ? 1 : 5)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Place Bid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
