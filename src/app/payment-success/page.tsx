'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentIntentId?: string;
    amount?: number;
    productName?: string;
  }>({});

  useEffect(() => {
    // Get payment details from URL params or localStorage
    const paymentIntentId = searchParams.get('payment_intent');
    const amount = searchParams.get('amount');
    const productName = searchParams.get('product_name');

    if (paymentIntentId || amount || productName) {
      setPaymentDetails({
        paymentIntentId: paymentIntentId || undefined,
        amount: amount ? parseInt(amount) : undefined,
        productName: productName || undefined,
      });
    } else {
      // Try to get from localStorage (fallback)
      const storedPayment = localStorage.getItem('lastPayment');
      if (storedPayment) {
        setPaymentDetails(JSON.parse(storedPayment));
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Payment Details
          </h3>
          
          <div className="space-y-3">
            {paymentDetails.paymentIntentId && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment ID:</span>
                <span className="text-sm font-mono text-gray-900">
                  {paymentDetails.paymentIntentId}
                </span>
              </div>
            )}
            
            {paymentDetails.amount && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${(paymentDetails.amount / 100).toFixed(2)}
                </span>
              </div>
            )}
            
            {paymentDetails.productName && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Product:</span>
                <span className="text-sm text-gray-900">
                  {paymentDetails.productName}
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="text-sm font-semibold text-green-600">
                Completed
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            What&apos;s Next?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You will receive a confirmation email shortly</li>
            <li>• The seller will be notified of your purchase</li>
            <li>• You can track your order in your account</li>
            <li>• Contact support if you have any questions</li>
          </ul>
        </div>

        <div className="flex space-x-4">
          <Link
            href="/"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
          >
            Continue Shopping
          </Link>
          
          <Link
            href="/"
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@pacmacmobile.com" className="text-blue-600 hover:text-blue-500">
              support@pacmacmobile.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
