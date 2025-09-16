'use client';

import { useState, useEffect } from 'react';
import { ShieldCheckIcon, CurrencyDollarIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface EscrowTransaction {
  id: string;
  escrowId: string;
  auctionId: string;
  buyerId: string;
  sellerId: string;
  productName: string;
  itemPrice: number;
  escrowFee: number;
  totalAmount: number;
  sellerAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'disputed';
  createdAt: string;
  updatedAt: string;
}

export default function EscrowDashboard() {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockTransactions: EscrowTransaction[] = [
      {
        id: '1',
        escrowId: 'escrow_1757977057836_abc123',
        auctionId: 'auction_123',
        buyerId: 'user_123',
        sellerId: 'seller_456',
        productName: 'iPhone 15 Pro',
        itemPrice: 2.50,
        escrowFee: 3.08,
        totalAmount: 5.58,
        sellerAmount: 2.50,
        status: 'completed',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z'
      },
      {
        id: '2',
        escrowId: 'escrow_1757977057837_def456',
        auctionId: 'auction_124',
        buyerId: 'user_789',
        sellerId: 'seller_101',
        productName: 'Samsung Galaxy S24',
        itemPrice: 1.75,
        escrowFee: 3.05,
        totalAmount: 4.80,
        sellerAmount: 1.75,
        status: 'delivered',
        createdAt: '2024-01-15T11:00:00Z',
        updatedAt: '2024-01-15T14:00:00Z'
      },
      {
        id: '3',
        escrowId: 'escrow_1757977057838_ghi789',
        auctionId: 'auction_125',
        buyerId: 'user_456',
        sellerId: 'seller_202',
        productName: 'MacBook Air M3',
        itemPrice: 3.25,
        escrowFee: 3.10,
        totalAmount: 6.35,
        sellerAmount: 3.25,
        status: 'paid',
        createdAt: '2024-01-15T12:00:00Z',
        updatedAt: '2024-01-15T12:00:00Z'
      }
    ];

    setTransactions(mockTransactions);
    
    // Calculate total earnings (escrow fees)
    const total = mockTransactions.reduce((sum, tx) => sum + tx.escrowFee, 0);
    setTotalEarnings(total);
    
    setLoading(false);
  }, []);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'paid': return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'shipped': return <ClockIcon className="h-4 w-4" />;
      case 'delivered': return <CheckCircleIcon className="h-4 w-4" />;
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'disputed': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading escrow dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Escrow Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and track all escrow transactions</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Escrow Fees</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions.filter(tx => tx.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions.filter(tx => ['pending', 'paid', 'shipped', 'delivered'].includes(tx.status)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disputed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions.filter(tx => tx.status === 'disputed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amounts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.escrowId}
                        </div>
                        <div className="text-sm text-gray-500">
                          Auction: {transaction.auctionId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Item: ${transaction.itemPrice.toFixed(2)}</div>
                        <div>Fee: ${transaction.escrowFee.toFixed(2)}</div>
                        <div className="font-medium">Total: ${transaction.totalAmount.toFixed(2)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1">{getStatusText(transaction.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fee Structure Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Escrow Fee Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Your Earnings</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• $3.00 flat fee per transaction</li>
                <li>• 3% of item price per transaction</li>
                <li>• Total: ${totalEarnings.toFixed(2)} earned</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">How It Works</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Buyer pays item price + escrow fees</li>
                <li>• Seller receives full item price</li>
                <li>• You keep the escrow fees</li>
                <li>• Funds held securely until delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
