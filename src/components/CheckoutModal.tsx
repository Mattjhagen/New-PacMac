'use client';

import { useState } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import StripePayment from './StripePayment';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  condition?: string;
  storage?: string;
  color?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onPaymentSuccess: (paymentIntent: { id: string; status: string }) => void;
}

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  product, 
  onPaymentSuccess 
}: CheckoutModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handlePaymentSuccess = (paymentIntent: { id: string; status: string }) => {
    setPaymentStatus('success');
    onPaymentSuccess(paymentIntent);
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      onClose();
      setPaymentStatus('idle');
      setError(null);
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus('error');
    setError(error);
  };

  const handleClose = () => {
    if (paymentStatus !== 'processing') {
      onClose();
      setPaymentStatus('idle');
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {paymentStatus === 'success' ? 'Payment Successful!' : 'Complete Purchase'}
          </h2>
          <button
            onClick={handleClose}
            disabled={paymentStatus === 'processing'}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentStatus === 'success' ? (
            <div className="text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600 mb-4">
                Your payment has been processed successfully. You will receive a confirmation email shortly.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Product:</strong> {product.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> ${(product.price / 100).toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Product Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center space-x-4">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600">{product.description}</p>
                    )}
                    {product.condition && (
                      <p className="text-sm text-gray-500">Condition: {product.condition}</p>
                    )}
                    {product.storage && (
                      <p className="text-sm text-gray-500">Storage: {product.storage}</p>
                    )}
                    {product.color && (
                      <p className="text-sm text-gray-500">Color: {product.color}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ${(product.price / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <StripePayment
                amount={product.price}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                metadata={{
                  productId: product.id,
                  productName: product.name,
                }}
              />

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>🔒 Secure Payment:</strong> Your payment information is encrypted and processed securely by Stripe. 
                  We never store your payment details.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}