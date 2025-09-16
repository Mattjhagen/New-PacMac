'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface Dispute {
  id: string;
  transactionId: string;
  productName: string;
  amount: number;
  type: 'item_not_received' | 'item_not_as_described' | 'damaged_item' | 'wrong_item' | 'seller_no_show' | 'buyer_no_show' | 'payment_issue' | 'other';
  status: 'open' | 'under_review' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  evidence: {
    images: string[];
    messages: string[];
    documents: string[];
  };
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

interface DisputeResolutionProps {
  userId: string;
  onDisputeCreated: (dispute: Dispute) => void;
  onDisputeUpdated: (disputeId: string, updates: Partial<Dispute>) => void;
}

export default function DisputeResolution({ 
  userId, 
  onDisputeCreated, 
  onDisputeUpdated 
}: DisputeResolutionProps) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form state for creating new dispute
  const [formData, setFormData] = useState({
    transactionId: '',
    productName: '',
    amount: 0,
    type: 'item_not_received' as Dispute['type'],
    description: '',
    priority: 'medium' as Dispute['priority']
  });

  // Mock disputes data - in production, fetch from API
  useEffect(() => {
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
        evidence: {
          images: ['evidence1.jpg', 'evidence2.jpg'],
          messages: ['msg1', 'msg2'],
          documents: []
        },
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
      }
    ];
    setDisputes(mockDisputes);
  }, [userId]);

  const getStatusColor = (status: Dispute['status']) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Dispute['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: Dispute['type']) => {
    const labels = {
      'item_not_received': 'Item Not Received',
      'item_not_as_described': 'Item Not As Described',
      'damaged_item': 'Damaged Item',
      'wrong_item': 'Wrong Item',
      'seller_no_show': 'Seller No Show',
      'buyer_no_show': 'Buyer No Show',
      'payment_issue': 'Payment Issue',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newDispute: Dispute = {
        id: `dispute_${Date.now()}`,
        transactionId: formData.transactionId,
        productName: formData.productName,
        amount: formData.amount,
        type: formData.type,
        status: 'open',
        priority: formData.priority,
        description: formData.description,
        evidence: {
          images: [],
          messages: [],
          documents: []
        },
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: `msg_${Date.now()}`,
            senderId: userId,
            senderName: 'You',
            message: formData.description,
            timestamp: new Date().toISOString(),
            isInternal: false
          }
        ]
      };

      setDisputes(prev => [newDispute, ...prev]);
      onDisputeCreated(newDispute);
      setShowCreateForm(false);
      setFormData({
        transactionId: '',
        productName: '',
        amount: 0,
        type: 'item_not_received',
        description: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating dispute:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedDispute) return;

    const message = {
      id: `msg_${Date.now()}`,
      senderId: userId,
      senderName: 'You',
      message: newMessage,
      timestamp: new Date().toISOString(),
      isInternal: false
    };

    const updatedDispute = {
      ...selectedDispute,
      messages: [...selectedDispute.messages, message],
      updatedAt: new Date().toISOString()
    };

    setDisputes(prev => prev.map(d => d.id === selectedDispute.id ? updatedDispute : d));
    setSelectedDispute(updatedDispute);
    onDisputeUpdated(selectedDispute.id, { messages: updatedDispute.messages });
    setNewMessage('');
  };

  const handleEmailDispute = (dispute: Dispute) => {
    const subject = `Dispute ${dispute.id} - ${dispute.productName}`;
    const body = `
Dispute ID: ${dispute.id}
Transaction ID: ${dispute.transactionId}
Product: ${dispute.productName}
Amount: $${dispute.amount}
Type: ${getTypeLabel(dispute.type)}
Status: ${dispute.status}
Priority: ${dispute.priority}

Description:
${dispute.description}

Please provide any additional information or evidence to help resolve this dispute.
    `.trim();

    const mailtoLink = `mailto:disputes@pacmacmobile.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dispute Resolution</h2>
          <p className="text-gray-600">Manage and track your transaction disputes</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
        >
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          Create Dispute
        </button>
      </div>

      {/* Create Dispute Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Dispute</h3>
          <form onSubmit={handleCreateDispute} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID</label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dispute Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Dispute['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="item_not_received">Item Not Received</option>
                  <option value="item_not_as_described">Item Not As Described</option>
                  <option value="damaged_item">Damaged Item</option>
                  <option value="wrong_item">Wrong Item</option>
                  <option value="seller_no_show">Seller No Show</option>
                  <option value="buyer_no_show">Buyer No Show</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Dispute['priority'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide a detailed description of the issue..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Dispute'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Disputes List */}
      <div className="space-y-4">
        {disputes.map((dispute) => (
          <div key={dispute.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{dispute.productName}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dispute.status)}`}>
                    {dispute.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(dispute.priority)}`}>
                    {dispute.priority}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Transaction ID:</span> {dispute.transactionId}
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span> ${dispute.amount.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {getTypeLabel(dispute.type)}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedDispute(dispute)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEmailDispute(dispute)}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors flex items-center"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                  Email
                </button>
              </div>
            </div>
            <p className="text-gray-700 text-sm">{dispute.description}</p>
          </div>
        ))}
      </div>

      {/* Dispute Detail Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Dispute Details</h3>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Dispute Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Dispute Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">ID:</span> {selectedDispute.id}</div>
                    <div><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedDispute.status)}`}>
                        {selectedDispute.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div><span className="font-medium">Priority:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedDispute.priority)}`}>
                        {selectedDispute.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Transaction Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Product:</span> {selectedDispute.productName}</div>
                    <div><span className="font-medium">Amount:</span> ${selectedDispute.amount.toFixed(2)}</div>
                    <div><span className="font-medium">Type:</span> {getTypeLabel(selectedDispute.type)}</div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Messages</h4>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {selectedDispute.messages.map((message) => (
                    <div key={message.id} className={`p-3 rounded-lg ${message.isInternal ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{message.senderName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Send Message */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-700 mb-4">
          If you need assistance with a dispute or have questions about our resolution process, 
          please don't hesitate to contact us.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="mailto:disputes@pacmacmobile.com"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PaperAirplaneIcon className="h-4 w-4 mr-2" />
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
  );
}
