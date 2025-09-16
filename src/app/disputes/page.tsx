'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import DisputeResolution from '@/components/DisputeResolution';
import DisputeTracker from '@/components/DisputeTracker';

interface Dispute {
  id: string;
  transactionId: string;
  productName: string;
  amount: number;
  type: 'item_not_received' | 'item_not_as_described' | 'damaged_item' | 'wrong_item' | 'seller_no_show' | 'buyer_no_show' | 'payment_issue' | 'other';
  status: 'open' | 'under_review' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: {
    decision: 'buyer_favor' | 'seller_favor' | 'partial_refund' | 'no_fault';
    amount?: number;
    reason: string;
    resolvedAt: string;
    resolvedBy: string;
  };
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
    isInternal: boolean;
  }[];
}

export default function DisputesPage() {
  const [currentTab, setCurrentTab] = useState<'create' | 'track'>('create');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState('demo-user'); // In real app, get from auth context

  // Fetch disputes on mount
  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        // In production, fetch from API
        // const response = await fetch(`/api/disputes?userId=${userId}`);
        // const data = await response.json();
        // setDisputes(data);
        
        // Mock data for now
        const mockDisputes: Dispute[] = [
          {
            id: 'dispute_1',
            transactionId: 'tx_123',
            productName: 'iPhone 15 Pro',
            amount: 899.99,
            type: 'item_not_as_described',
            status: 'under_review',
            priority: 'high',
            description: 'The phone was described as "like new" but has significant scratches on the screen and back.',
            createdBy: userId,
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T14:20:00Z',
            assignedTo: 'support_agent_1',
            messages: [
              {
                id: 'msg1',
                senderId: userId,
                senderName: 'You',
                message: 'I received the phone but it has scratches that weren\'t mentioned in the listing.',
                timestamp: '2024-01-15T10:30:00Z',
                isInternal: false
              },
              {
                id: 'msg2',
                senderId: 'support_agent_1',
                senderName: 'Support Agent',
                message: 'Thank you for reporting this issue. We\'re reviewing the evidence and will get back to you within 24 hours.',
                timestamp: '2024-01-15T11:15:00Z',
                isInternal: false
              }
            ]
          },
          {
            id: 'dispute_2',
            transactionId: 'tx_456',
            productName: 'Samsung Galaxy S24',
            amount: 799.99,
            type: 'item_not_received',
            status: 'resolved',
            priority: 'medium',
            description: 'I paid for the phone but never received it. Seller stopped responding to messages.',
            createdBy: userId,
            createdAt: '2024-01-10T09:15:00Z',
            updatedAt: '2024-01-12T16:45:00Z',
            assignedTo: 'support_agent_2',
            resolution: {
              decision: 'buyer_favor',
              amount: 799.99,
              reason: 'Seller failed to provide proof of shipment and stopped responding to communications.',
              resolvedAt: '2024-01-12T16:45:00Z',
              resolvedBy: 'support_agent_2'
            },
            messages: [
              {
                id: 'msg3',
                senderId: userId,
                senderName: 'You',
                message: 'I haven\'t received the phone and the seller isn\'t responding.',
                timestamp: '2024-01-10T09:15:00Z',
                isInternal: false
              },
              {
                id: 'msg4',
                senderId: 'support_agent_2',
                senderName: 'Support Agent',
                message: 'We\'ve reviewed your case and found in your favor. A full refund has been processed.',
                timestamp: '2024-01-12T16:45:00Z',
                isInternal: false
              }
            ]
          }
        ];
        setDisputes(mockDisputes);
      } catch (error) {
        console.error('Error fetching disputes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisputes();
  }, [userId]);

  const handleDisputeCreated = (newDispute: Dispute) => {
    setDisputes(prev => [newDispute, ...prev]);
    setCurrentTab('track'); // Switch to tracker after creating
  };

  const handleDisputeUpdated = async (disputeId: string, updates: Partial<Dispute>) => {
    try {
      // In production, update via API
      // await fetch(`/api/disputes/${disputeId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // });

      // Update local state
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { ...dispute, ...updates, updatedAt: new Date().toISOString() }
          : dispute
      ));
    } catch (error) {
      console.error('Error updating dispute:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-6"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to App
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dispute Resolution Center</h1>
              <p className="text-gray-600">Create and track transaction disputes</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setCurrentTab('create')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentTab === 'create'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>Create Dispute</span>
            </button>
            <button
              onClick={() => setCurrentTab('track')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentTab === 'track'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <DocumentTextIcon className="h-4 w-4" />
              <span>Track Disputes ({disputes.length})</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {currentTab === 'create' ? (
          <DisputeResolution
            userId={userId}
            onDisputeCreated={handleDisputeCreated}
            onDisputeUpdated={handleDisputeUpdated}
          />
        ) : (
          <DisputeTracker
            userId={userId}
            disputes={disputes}
            onDisputeUpdate={handleDisputeUpdated}
          />
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help with a Dispute?</h3>
              <p className="text-blue-700 mb-4">
                Our dispute resolution team is here to help. We aim to resolve disputes fairly and quickly, 
                typically within 24-48 hours for most cases.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:disputes@pacmacmobile.com"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                  Email Disputes Team
                </a>
                <a
                  href="mailto:support@pacmacmobile.com"
                  className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  General Support
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Information */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Legal Information</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              • PacMac Mobile acts as an intermediary platform and is not responsible for the quality, condition, 
              or authenticity of items sold through our platform.
            </p>
            <p>
              • All transactions are between individual users. We provide dispute resolution services but cannot 
              guarantee outcomes or enforce resolutions outside our platform.
            </p>
            <p>
              • Dispute resolution decisions are final and binding. We reserve the right to suspend or terminate 
              accounts that abuse the dispute system.
            </p>
            <p>
              • For more information, please review our{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
