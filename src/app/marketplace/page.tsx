'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TinderMarketplace from '@/components/TinderMarketplace';
import AuctionSystem from '@/components/AuctionSystem';
import ChatUnlock from '@/components/ChatUnlock';
import PointsSystem from '@/components/PointsSystem';
import { HeartIcon, ChatBubbleLeftRightIcon, TrophyIcon, HomeIcon } from '@heroicons/react/24/outline';

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

export default function MarketplacePage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'swipe' | 'auction' | 'chat' | 'points'>('swipe');
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [passedProducts, setPassedProducts] = useState<Product[]>([]);

  // Mock user data - in real app, this would come from authentication
  useEffect(() => {
    setUser({
      id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
      points: 25,
      totalSpent: 150.00,
      totalEarned: 50.00,
      successfulTransactions: 5,
      rating: 4.8,
      joinDate: '2024-01-15'
    });
  }, []);

  // Mock products data - in real app, this would come from API
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'iPhone 15 Pro',
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        price: 999,
        description: 'Latest iPhone with titanium design and A17 Pro chip',
        imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        img: '',
        tags: ['smartphone', 'apple', 'premium'],
        specs: {
          display: '6.1" Super Retina XDR',
          processor: 'A17 Pro',
          storage: '128GB',
          camera: '48MP Main Camera',
          battery: 'Up to 23 hours video playback'
        },
        inStock: true,
        stockCount: 1,
        category: 'smartphones',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        auctionEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        currentBid: 1.25,
        bidCount: 8,
        startingPrice: 0.99
      },
      {
        id: '2',
        name: 'Samsung Galaxy S24',
        brand: 'Samsung',
        model: 'Galaxy S24',
        price: 799,
        description: 'AI-powered smartphone with advanced camera features',
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        img: '',
        tags: ['smartphone', 'samsung', 'android'],
        specs: {
          display: '6.2" Dynamic AMOLED 2X',
          processor: 'Snapdragon 8 Gen 3',
          storage: '256GB',
          camera: '50MP Main Camera',
          battery: '4000mAh'
        },
        inStock: true,
        stockCount: 1,
        category: 'smartphones',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        auctionEndTime: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        currentBid: 0.99,
        bidCount: 3,
        startingPrice: 0.99
      },
      {
        id: '3',
        name: 'MacBook Air M3',
        brand: 'Apple',
        model: 'MacBook Air M3',
        price: 1099,
        description: 'Ultra-thin laptop with M3 chip and all-day battery',
        imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
        img: '',
        tags: ['laptop', 'apple', 'macbook'],
        specs: {
          display: '13.6" Liquid Retina',
          processor: 'Apple M3',
          storage: '256GB SSD',
          battery: 'Up to 18 hours'
        },
        inStock: true,
        stockCount: 1,
        category: 'laptops',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        auctionEndTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        currentBid: 2.15,
        bidCount: 12,
        startingPrice: 0.99
      }
    ];
    setProducts(mockProducts);
  }, []);

  const handleSwipeLeft = (product: Product) => {
    console.log('Swiped left on:', product.name);
    setPassedProducts(prev => [...prev, product]);
  };

  const handleSwipeRight = (product: Product) => {
    console.log('Swiped right on:', product.name);
    // Create auction for this product
    const auction: Auction = {
      id: `auction_${product.id}`,
      productId: product.id,
      startingPrice: 0.99,
      currentBid: 0.99,
      bidCount: 0,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      bids: []
    };
    setCurrentAuction(auction);
    setCurrentView('auction');
  };

  const handleSwipeUp = (product: Product) => {
    console.log('Swiped up on:', product.name);
    setSavedProducts(prev => [...prev, product]);
  };

  const handleSwipeDown = (product: Product) => {
    console.log('Swiped down on:', product.name);
    setPassedProducts(prev => [...prev, product]);
  };

  const handleBid = (product: Product, amount: number, usePoints: boolean = false) => {
    console.log('Bidding on:', product.name, 'Amount:', amount, 'Use points:', usePoints);
    
    if (usePoints && user) {
      const pointsNeeded = amount === 1.00 ? 1 : 5;
      if (user.points >= pointsNeeded) {
        setUser(prev => prev ? { ...prev, points: prev.points - pointsNeeded } : null);
      }
    }
    
    // In real app, this would make an API call to place the bid
    if (currentAuction) {
      const newBid: Bid = {
        id: `bid_${Date.now()}`,
        userId: user?.id || 'user_123',
        userName: user?.name || 'You',
        amount: amount,
        timestamp: new Date().toISOString(),
        isWinning: true
      };
      
      setCurrentAuction(prev => prev ? {
        ...prev,
        currentBid: prev.currentBid + amount,
        bidCount: prev.bidCount + 1,
        bids: [...prev.bids, newBid]
      } : null);
    }
  };

  const handleAuctionWin = (auction: Auction) => {
    console.log('Auction won:', auction.id);
    setCurrentView('chat');
  };

  const handlePaymentComplete = () => {
    console.log('Payment completed');
    // In real app, this would update the auction status and unlock chat
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'swipe':
        return (
          <TinderMarketplace
            products={products}
            userPoints={user?.points || 0}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSwipeUp={handleSwipeUp}
            onSwipeDown={handleSwipeDown}
            onBid={handleBid}
          />
        );
      case 'auction':
        return currentAuction ? (
          <AuctionSystem
            auction={currentAuction}
            currentUserId={user?.id || 'user_123'}
            onBid={(amount) => handleBid(products.find(p => p.id === currentAuction.productId)!, amount)}
            onWin={handleAuctionWin}
          />
        ) : null;
      case 'chat':
        return (
          <ChatUnlock
            auctionId={currentAuction?.id || ''}
            winnerId={user?.id || 'user_123'}
            currentUserId={user?.id || 'user_123'}
            productName={products.find(p => p.id === currentAuction?.productId)?.name || ''}
            winningBid={currentAuction?.currentBid || 0.99}
            sellerInfo={{
              name: 'Jane Smith',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
              rating: 4.9,
              location: 'San Francisco, CA'
            }}
            meetupLocation={{
              address: '123 Market Street, San Francisco, CA 94102',
              coordinates: { lat: 37.7749, lng: -122.4194 },
              instructions: 'Meet at the coffee shop on the corner. Look for the blue jacket.'
            }}
            onPaymentComplete={(escrowId) => {
              console.log('Escrow payment completed:', escrowId);
              handlePaymentComplete();
            }}
          />
        );
      case 'points':
        return user ? (
          <PointsSystem
            user={user}
            transactions={[]} // In real app, this would come from API
            onPointsUpdate={(newPoints) => setUser(prev => prev ? { ...prev, points: newPoints } : null)}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <HomeIcon className="h-6 w-6" />
            </button>
            
            <h1 className="text-xl font-bold text-gray-900">PacMac Marketplace</h1>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-pink-600">
                <HeartIcon className="h-5 w-5 mr-1" />
                <span className="font-semibold">{user?.points || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentView('swipe')}
              className={`flex-1 py-3 px-4 text-center font-medium rounded-t-lg ${
                currentView === 'swipe'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Swipe
            </button>
            <button
              onClick={() => setCurrentView('auction')}
              className={`flex-1 py-3 px-4 text-center font-medium rounded-t-lg ${
                currentView === 'auction'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Auction
            </button>
            <button
              onClick={() => setCurrentView('chat')}
              className={`flex-1 py-3 px-4 text-center font-medium rounded-t-lg ${
                currentView === 'chat'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setCurrentView('points')}
              className={`flex-1 py-3 px-4 text-center font-medium rounded-t-lg ${
                currentView === 'points'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Points
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto">
        {renderCurrentView()}
      </div>
    </div>
  );
}
