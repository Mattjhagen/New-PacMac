'use client';

import { useState } from 'react';
import { ShieldCheckIcon, CurrencyDollarIcon, CalculatorIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface EscrowFee {
  flatFee: number;
  percentageFee: number;
  totalAmount: number;
  escrowFee: number;
  sellerAmount: number;
  breakdown: {
    itemPrice: number;
    flatFee: number;
    percentageFee: number;
    totalEscrowFee: number;
  };
}

interface EscrowSystemProps {
  itemPrice: number;
  onFeeCalculated: (fee: EscrowFee) => void;
  onPaymentComplete: (escrowId: string) => void;
}

export default function EscrowSystem({ itemPrice, onFeeCalculated, onPaymentComplete }: EscrowSystemProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate escrow fees
  const calculateEscrowFees = (price: number): EscrowFee => {
    const flatFee = 3.00; // $3 flat fee
    const percentageFee = price * 0.03; // 3% of item price
    const totalEscrowFee = flatFee + percentageFee;
    const totalAmount = price + totalEscrowFee;
    const sellerAmount = price; // Seller gets the original item price

    const breakdown = {
      itemPrice: price,
      flatFee,
      percentageFee,
      totalEscrowFee
    };

    return {
      flatFee,
      percentageFee,
      totalAmount,
      escrowFee: totalEscrowFee,
      sellerAmount,
      breakdown
    };
  };

  const escrowFee = calculateEscrowFees(itemPrice);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create escrow via API
      const response = await fetch('/api/escrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemPrice: escrowFee.breakdown.itemPrice,
          auctionId: 'auction_123', // This would come from props in real app
          buyerId: 'user_123', // This would come from auth context
          sellerId: 'seller_456', // This would come from auction data
          productName: 'Test Product' // This would come from props
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create escrow');
      }

      console.log('Escrow created:', {
        escrowId: data.escrowId,
        paymentIntentId: data.paymentIntentId,
        itemPrice: escrowFee.breakdown.itemPrice,
        escrowFee: escrowFee.escrowFee,
        totalAmount: escrowFee.totalAmount,
        sellerAmount: escrowFee.sellerAmount
      });

      // In a real implementation, you would:
      // 1. Use the clientSecret to complete payment with Stripe
      // 2. Handle payment confirmation
      // 3. Update escrow status
      
      // For now, simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onPaymentComplete(data.escrowId);
    } catch (error) {
      console.error('Escrow payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Escrow Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
          <ShieldCheckIcon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Secure Escrow Payment</h3>
        <p className="text-gray-600">Your payment is protected by our escrow service</p>
      </div>

      {/* Fee Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-900">Payment Breakdown</h4>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <InformationCircleIcon className="h-4 w-4 mr-1" />
            {showBreakdown ? 'Hide' : 'Show'} Details
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Item Price</span>
            <span className="font-medium">${escrowFee.breakdown.itemPrice.toFixed(2)}</span>
          </div>
          
          {showBreakdown && (
            <>
              <div className="flex justify-between text-sm text-gray-500 pl-4">
                <span>• Escrow Flat Fee</span>
                <span>${escrowFee.breakdown.flatFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 pl-4">
                <span>• Escrow Percentage (3%)</span>
                <span>${escrowFee.breakdown.percentageFee.toFixed(2)}</span>
              </div>
            </>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Escrow Fee</span>
            <span className="font-medium text-blue-600">${escrowFee.escrowFee.toFixed(2)}</span>
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span className="text-green-600">${escrowFee.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Escrow Benefits */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2" />
          Escrow Protection
        </h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span>Payment held securely until item is received</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span>Full refund if item doesn't match description</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span>Dispute resolution support</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span>Seller receives payment after confirmation</span>
          </div>
        </div>
      </div>

      {/* Seller Information */}
      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-green-900 mb-2">Seller Payment</h4>
        <div className="flex justify-between items-center">
          <span className="text-green-700">Amount seller will receive:</span>
          <span className="font-semibold text-green-600">${escrowFee.sellerAmount.toFixed(2)}</span>
        </div>
        <p className="text-xs text-green-600 mt-1">
          Seller receives payment after you confirm item receipt
        </p>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            Pay ${escrowFee.totalAmount.toFixed(2)} Securely
          </>
        )}
      </button>

      {/* Fee Information */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Escrow fees: $3.00 flat + 3% of item price
        </p>
        <p className="text-xs text-gray-500">
          This ensures secure transactions for both buyers and sellers
        </p>
      </div>
    </div>
  );
}

// Escrow Status Component
interface EscrowStatusProps {
  escrowId: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'disputed';
  itemPrice: number;
  escrowFee: number;
  sellerAmount: number;
  onConfirmDelivery: () => void;
  onDispute: () => void;
}

export function EscrowStatus({ 
  escrowId, 
  status, 
  itemPrice, 
  escrowFee, 
  sellerAmount, 
  onConfirmDelivery, 
  onDispute 
}: EscrowStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'paid': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'disputed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Payment Pending';
      case 'paid': return 'Payment Received';
      case 'shipped': return 'Item Shipped';
      case 'delivered': return 'Item Delivered';
      case 'completed': return 'Transaction Complete';
      case 'disputed': return 'Dispute in Progress';
      default: return 'Unknown Status';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Escrow Status</h3>
        <p className="text-sm text-gray-600">Transaction ID: {escrowId}</p>
      </div>

      {/* Status Badge */}
      <div className="text-center mb-6">
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
          {getStatusText(status)}
        </span>
      </div>

      {/* Transaction Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Transaction Details</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Item Price</span>
            <span className="font-medium">${itemPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Escrow Fee</span>
            <span className="font-medium text-blue-600">${escrowFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Seller Amount</span>
            <span className="font-medium text-green-600">${sellerAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {status === 'delivered' && (
        <div className="space-y-3">
          <button
            onClick={onConfirmDelivery}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
          >
            Confirm Item Received - Release Payment
          </button>
          <button
            onClick={onDispute}
            className="w-full border border-red-300 text-red-600 py-3 px-4 rounded-lg font-semibold hover:bg-red-50"
          >
            Report Issue
          </button>
        </div>
      )}

      {status === 'completed' && (
        <div className="text-center">
          <div className="text-green-600 text-lg font-semibold mb-2">✅ Transaction Complete</div>
          <p className="text-gray-600">Payment has been released to the seller</p>
        </div>
      )}
    </div>
  );
}
