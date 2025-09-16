'use client';

import { useState } from 'react';
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

interface ProductCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onPaymentSuccess: (paymentIntent: { id: string; status: string }) => void;
}

export default function ProductCheckoutModal({ 
  isOpen, 
  onClose, 
  product, 
  onPaymentSuccess 
}: ProductCheckoutModalProps) {
  const [step, setStep] = useState<'review' | 'payment' | 'success'>('review');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const subtotal = product.price;
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + tax;

  const handlePaymentSuccess = (paymentIntent: { id: string; status: string }) => {
    console.log('Payment successful:', paymentIntent);
    setStep('success');
    onPaymentSuccess(paymentIntent);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const handleClose = () => {
    setStep('review');
    setPaymentError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Checkout</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {step === 'review' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{product.name}</span>
                  <span>${product.price.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (7%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('payment')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700"
            >
              Proceed to Payment
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <button
                onClick={() => setStep('review')}
                className="text-blue-600 hover:text-blue-800 mr-2"
              >
                ← Back
              </button>
              <h3 className="font-semibold">Payment Information</h3>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Total Amount:</div>
              <div className="text-2xl font-bold">${total.toFixed(2)}</div>
            </div>

            <StripePayment
              amount={total}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              metadata={{
                order_id: `order_${Date.now()}`,
                product_id: product.id,
                product_name: product.name,
                customer_email: 'customer@pacmacmobile.com', // You can make this dynamic
              }}
            />

            {paymentError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {paymentError}
              </div>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-semibold text-green-600">
              Payment Successful!
            </h3>
            <p className="text-gray-600">
              Thank you for your purchase. You will receive a confirmation email shortly.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
