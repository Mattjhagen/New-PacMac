'use client';

import { useState } from 'react';
import { LockClosedIcon, ChatBubbleLeftRightIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ChatUnlockProps {
  auctionId: string;
  winnerId: string;
  currentUserId: string;
  productName: string;
  sellerInfo: {
    name: string;
    avatar?: string;
    rating: number;
    location: string;
  };
  meetupLocation: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    instructions: string;
  };
  onPaymentComplete: () => void;
}

export default function ChatUnlock({
  auctionId,
  winnerId,
  currentUserId,
  productName,
  sellerInfo,
  meetupLocation,
  onPaymentComplete
}: ChatUnlockProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const isWinner = currentUserId === winnerId;

  if (!isWinner) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <LockClosedIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Auction Won by Another User</h3>
        <p className="text-gray-600">This auction has been won by another bidder.</p>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Complete!</h3>
          <p className="text-gray-600">You can now contact the seller and arrange pickup.</p>
        </div>

        {/* Seller Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Seller Information</h4>
          <div className="flex items-center space-x-3">
            {sellerInfo.avatar ? (
              <img
                src={sellerInfo.avatar}
                alt={sellerInfo.name}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-semibold">
                  {sellerInfo.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{sellerInfo.name}</p>
              <p className="text-sm text-gray-600">⭐ {sellerInfo.rating}/5.0</p>
            </div>
          </div>
        </div>

        {/* Meetup Location */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2" />
            Meetup Location
          </h4>
          <p className="text-gray-700 mb-2">{meetupLocation.address}</p>
          <p className="text-sm text-gray-600">{meetupLocation.instructions}</p>
        </div>

        {/* Chat Button */}
        <button
          onClick={() => setIsUnlocked(true)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
          Start Chat with Seller
        </button>
      </div>
    );
  }

  if (showPayment) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <LockClosedIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Purchase</h3>
          <p className="text-gray-600">Pay the winning bid to unlock chat and meetup details.</p>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{productName}</span>
              <span className="font-medium">$0.99</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Winning Bid</span>
              <span className="font-medium">$2.50</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>$3.49</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-3">
          <button
            onClick={() => setPaymentComplete(true)}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
          >
            Pay with Stripe ($3.49)
          </button>
          <button
            onClick={() => setShowPayment(false)}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <LockClosedIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Congratulations!</h3>
      <p className="text-gray-600 mb-4">You won the auction for <strong>{productName}</strong></p>
      <p className="text-sm text-gray-500 mb-6">
        Complete your payment to unlock chat with the seller and get meetup details.
      </p>
      
      <button
        onClick={() => setShowPayment(true)}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700"
      >
        Complete Purchase
      </button>
    </div>
  );
}

// Chat Interface Component
interface ChatInterfaceProps {
  sellerInfo: {
    name: string;
    avatar?: string;
  };
  onClose: () => void;
}

export function ChatInterface({ sellerInfo, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'seller',
      message: 'Hi! Thanks for winning the auction. When would you like to meet up?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: messages.length + 1,
      sender: 'buyer',
      message: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md h-96 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            {sellerInfo.avatar ? (
              <img
                src={sellerInfo.avatar}
                alt={sellerInfo.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-semibold text-sm">
                  {sellerInfo.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{sellerInfo.name}</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  message.sender === 'buyer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
