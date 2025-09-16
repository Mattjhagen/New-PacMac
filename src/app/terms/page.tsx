'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-6"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to App
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notice</h3>
                <p className="text-yellow-700">
                  PacMac Mobile is a marketplace platform that connects buyers and sellers. We do not guarantee the quality, 
                  condition, or authenticity of items sold through our platform. All transactions are between individual users, 
                  and PacMac Mobile acts solely as an intermediary service.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using PacMac Mobile ("the Service"), you accept and agree to be bound by the terms and 
              provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              PacMac Mobile is a peer-to-peer marketplace platform that facilitates the buying and selling of mobile devices 
              and related accessories. Our services include:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>User account management and authentication</li>
              <li>Product listing and search functionality</li>
              <li>Payment processing and escrow services</li>
              <li>Location-based recommendations and local item discovery</li>
              <li>Transaction monitoring and dispute resolution</li>
              <li>Communication tools between buyers and sellers</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Account Security</h3>
            <p className="text-gray-700 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities 
              that occur under your account. You agree to immediately notify us of any unauthorized use of your account.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Accurate Information</h3>
            <p className="text-gray-700 mb-4">
              You agree to provide accurate, current, and complete information during registration and to update such 
              information to keep it accurate, current, and complete.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Prohibited Activities</h3>
            <p className="text-gray-700 mb-2">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>List counterfeit, stolen, or illegal items</li>
              <li>Engage in fraudulent activities or misrepresentation</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Interfere with the proper functioning of the Service</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use the Service for any commercial purpose without authorization</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Transaction Terms</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 No Guarantees</h3>
            <p className="text-gray-700 mb-4">
              <strong>PacMac Mobile makes no warranties or guarantees regarding:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>The quality, condition, or authenticity of items sold</li>
              <li>The accuracy of product descriptions or images</li>
              <li>The reliability or honesty of other users</li>
              <li>The outcome of any transaction</li>
              <li>Delivery times or shipping conditions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Location-Based Services</h3>
            <p className="text-gray-700 mb-4">
              Our platform uses location data to show local items and facilitate in-person meetups. By using our Service, 
              you consent to the collection and use of your location data for these purposes. You understand that:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Location data is used to improve recommendations and show nearby items</li>
              <li>Proximity verification may be required for certain transactions</li>
              <li>Location data may be shared with other users for transaction purposes</li>
              <li>You can disable location services, but this may limit functionality</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Transaction Completion</h3>
            <p className="text-gray-700 mb-4">
              All transactions are between individual users. PacMac Mobile is not responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Items not received or not as described</li>
              <li>Damages occurring during shipping or meetups</li>
              <li>Disputes between buyers and sellers</li>
              <li>Any issues that occur outside of our platform</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Account Management</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Account Review</h3>
            <p className="text-gray-700 mb-4">
              PacMac Mobile reserves the right to review any account at any time. Accounts may be subject to manual review 
              for various reasons including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Suspicious activity or behavior</li>
              <li>Multiple dispute reports</li>
              <li>Violation of community guidelines</li>
              <li>Security concerns</li>
              <li>Compliance with legal requirements</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Account Suspension and Termination</h3>
            <p className="text-gray-700 mb-4">
              We reserve the right to suspend or terminate your account at any time, with or without notice, for any reason, 
              including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Violation of these Terms of Service</li>
              <li>Fraudulent or illegal activity</li>
              <li>Abuse of the platform or other users</li>
              <li>Failure to resolve disputes in good faith</li>
              <li>Any other reason we deem necessary to protect the integrity of our platform</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Dispute Resolution</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Dispute Process</h3>
            <p className="text-gray-700 mb-4">
              If you have a dispute with another user, you agree to first attempt to resolve the dispute directly with the 
              other party. If direct resolution is not possible, you may submit a dispute through our platform or contact 
              us at <a href="mailto:disputes@pacmacmobile.com" className="text-blue-600 hover:underline">disputes@pacmacmobile.com</a>.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Our Role in Disputes</h3>
            <p className="text-gray-700 mb-4">
              PacMac Mobile may assist in dispute resolution but is not obligated to do so. We reserve the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Investigate disputes and gather information</li>
              <li>Suspend accounts pending dispute resolution</li>
              <li>Provide evidence to law enforcement if necessary</li>
              <li>Refuse to participate in certain disputes</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Limitation of Liability</h3>
            <p className="text-gray-700 mb-6">
              PacMac Mobile's liability in any dispute is limited to the amount of fees we have collected from the transaction 
              in question. We are not liable for any indirect, incidental, special, or consequential damages.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Collection and Use</h2>
            <p className="text-gray-700 mb-4">
              We collect and use data as described in our Privacy Policy. By using our Service, you consent to our data 
              collection and use practices, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Location data for local recommendations and proximity verification</li>
              <li>Transaction data for fraud prevention and service improvement</li>
              <li>User behavior data for personalized recommendations</li>
              <li>Communication data for dispute resolution and customer support</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-700 mb-6">
              The Service and its original content, features, and functionality are and will remain the exclusive property 
              of PacMac Mobile and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modifications to Terms</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via 
              email or through the Service. Continued use of the Service after such modifications constitutes acceptance 
              of the updated terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction 
              in which PacMac Mobile operates, without regard to conflict of law principles.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                <strong>Email:</strong> <a href="mailto:legal@pacmacmobile.com" className="text-blue-600 hover:underline">legal@pacmacmobile.com</a><br />
                <strong>Disputes:</strong> <a href="mailto:disputes@pacmacmobile.com" className="text-blue-600 hover:underline">disputes@pacmacmobile.com</a><br />
                <strong>General Support:</strong> <a href="mailto:support@pacmacmobile.com" className="text-blue-600 hover:underline">support@pacmacmobile.com</a>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Rights</h3>
                  <p className="text-blue-700 text-sm">
                    You have the right to access, update, or delete your personal information. You also have the right to 
                    opt out of certain data collection practices. For more information, please review our Privacy Policy 
                    or contact us directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
