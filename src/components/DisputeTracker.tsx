'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  DocumentTextIcon,
  PaperAirplaneIcon
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

interface DisputeTrackerProps {
  userId: string;
  disputes: Dispute[];
  onDisputeUpdate: (disputeId: string, updates: Partial<Dispute>) => void;
}

export default function DisputeTracker({ 
  userId, 
  disputes, 
  onDisputeUpdate 
}: DisputeTrackerProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'under_review' | 'resolved' | 'closed'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'priority' | 'amount'>('updated');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  // Filter and sort disputes
  const filteredDisputes = disputes
    .filter(dispute => filter === 'all' || dispute.status === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'amount':
          return b.amount - a.amount;
        default:
          return 0;
      }
    });

  // Calculate statistics
  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    underReview: disputes.filter(d => d.status === 'under_review').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
    closed: disputes.filter(d => d.status === 'closed').length,
    escalated: disputes.filter(d => d.status === 'escalated').length
  };

  const getStatusIcon = (status: Dispute['status']) => {
    switch (status) {
      case 'open':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'under_review':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case 'resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'closed':
        return <XCircleIcon className="h-5 w-5 text-gray-600" />;
      case 'escalated':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

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

  const getResolutionLabel = (decision: string) => {
    const labels = {
      'buyer_favor': 'Buyer Favor',
      'seller_favor': 'Seller Favor',
      'partial_refund': 'Partial Refund',
      'no_fault': 'No Fault Found'
    };
    return labels[decision as keyof typeof labels] || decision;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSinceUpdate = (dateString: string) => {
    const now = new Date();
    const updated = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dispute Tracker</h2>
          <p className="text-gray-600">Monitor and track your dispute resolution progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="updated">Last Updated</option>
            <option value="created">Date Created</option>
            <option value="priority">Priority</option>
            <option value="amount">Amount</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Open</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.open}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Under Review</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.underReview}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Closed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.closed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Escalated</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.escalated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All', count: stats.total },
          { key: 'open', label: 'Open', count: stats.open },
          { key: 'under_review', label: 'Under Review', count: stats.underReview },
          { key: 'resolved', label: 'Resolved', count: stats.resolved },
          { key: 'closed', label: 'Closed', count: stats.closed }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.length === 0 ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You haven't created any disputes yet." 
                : `No disputes with status "${filter.replace('_', ' ')}".`
              }
            </p>
          </div>
        ) : (
          filteredDisputes.map((dispute) => (
            <div key={dispute.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(dispute.status)}
                    <h3 className="text-lg font-semibold text-gray-900">{dispute.productName}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dispute.status)}`}>
                      {dispute.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Transaction ID</p>
                      <p className="font-medium text-gray-900">{dispute.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium text-gray-900">${dispute.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium text-gray-900">{getTypeLabel(dispute.type)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium text-gray-900">{getTimeSinceUpdate(dispute.updatedAt)}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4">{dispute.description}</p>

                  {/* Resolution Info */}
                  {dispute.resolution && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-green-900">Resolution</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-green-800">Decision:</span>
                          <span className="ml-2 text-green-700">{getResolutionLabel(dispute.resolution.decision)}</span>
                        </div>
                        {dispute.resolution.amount && (
                          <div>
                            <span className="font-medium text-green-800">Amount:</span>
                            <span className="ml-2 text-green-700">${dispute.resolution.amount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <span className="font-medium text-green-800">Reason:</span>
                          <span className="ml-2 text-green-700">{dispute.resolution.reason}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Resolved:</span>
                          <span className="ml-2 text-green-700">{formatDate(dispute.resolution.resolvedAt)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">By:</span>
                          <span className="ml-2 text-green-700">{dispute.resolution.resolvedBy}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress Timeline */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Created: {formatDate(dispute.createdAt)}</span>
                    </div>
                    {dispute.assignedTo && (
                      <div className="flex items-center space-x-1">
                        <UserIcon className="h-4 w-4" />
                        <span>Assigned to: {dispute.assignedTo}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <TagIcon className="h-4 w-4" />
                      <span>{dispute.messages.length} messages</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => setSelectedDispute(dispute)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <a
                    href={`mailto:disputes@pacmacmobile.com?subject=Dispute ${dispute.id} - ${dispute.productName}`}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                    Email
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
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
                    <div><span className="font-medium">Created:</span> {formatDate(selectedDispute.createdAt)}</div>
                    <div><span className="font-medium">Updated:</span> {formatDate(selectedDispute.updatedAt)}</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Transaction Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Product:</span> {selectedDispute.productName}</div>
                    <div><span className="font-medium">Amount:</span> ${selectedDispute.amount.toFixed(2)}</div>
                    <div><span className="font-medium">Type:</span> {getTypeLabel(selectedDispute.type)}</div>
                    {selectedDispute.assignedTo && (
                      <div><span className="font-medium">Assigned to:</span> {selectedDispute.assignedTo}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedDispute.description}</p>
              </div>

              {/* Messages */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Messages ({selectedDispute.messages.length})</h4>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {selectedDispute.messages.map((message) => (
                    <div key={message.id} className={`p-3 rounded-lg ${message.isInternal ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{message.senderName}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              {selectedDispute.resolution && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Resolution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-800">Decision:</span>
                      <span className="ml-2 text-green-700">{getResolutionLabel(selectedDispute.resolution.decision)}</span>
                    </div>
                    {selectedDispute.resolution.amount && (
                      <div>
                        <span className="font-medium text-green-800">Amount:</span>
                        <span className="ml-2 text-green-700">${selectedDispute.resolution.amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <span className="font-medium text-green-800">Reason:</span>
                      <span className="ml-2 text-green-700">{selectedDispute.resolution.reason}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Resolved:</span>
                      <span className="ml-2 text-green-700">{formatDate(selectedDispute.resolution.resolvedAt)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">By:</span>
                      <span className="ml-2 text-green-700">{selectedDispute.resolution.resolvedBy}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
