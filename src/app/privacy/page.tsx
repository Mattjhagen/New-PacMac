'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ShieldCheckIcon, EyeIcon, MapPinIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function PrivacyPolicyPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* Privacy Overview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Privacy Matters</h3>
                <p className="text-blue-700">
                  At PacMac Mobile, we are committed to protecting your privacy and being transparent about how we collect, 
                  use, and share your information. This Privacy Policy explains our practices regarding your personal data.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Personal Information</h3>
            <p className="text-gray-700 mb-4">We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Account information (name, email, phone number)</li>
              <li>Profile information and preferences</li>
              <li>Payment and banking information (encrypted and secure)</li>
              <li>Product listings and descriptions</li>
              <li>Messages and communications with other users</li>
              <li>Reviews and ratings you provide</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 Location Information</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Location Data Usage</h4>
                  <p className="text-green-700 text-sm">
                    We collect precise location data to show you local items, enable proximity verification for transactions, 
                    and improve our recommendation algorithms. This helps you find items near you and ensures secure meetups.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-4">We collect location information including:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>GPS coordinates when you enable location services</li>
              <li>IP address-based approximate location</li>
              <li>Location data during transactions for proximity verification</li>
              <li>Location preferences and saved addresses</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">1.3 Usage Information</h3>
            <p className="text-gray-700 mb-4">We automatically collect information about how you use our Service:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Device information (type, operating system, browser)</li>
              <li>Log data (IP address, access times, pages viewed)</li>
              <li>Search queries and browsing behavior</li>
              <li>Transaction history and patterns</li>
              <li>App performance and crash reports</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Service Provision</h3>
            <p className="text-gray-700 mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Provide and maintain our marketplace platform</li>
              <li>Process transactions and payments</li>
              <li>Enable communication between buyers and sellers</li>
              <li>Verify user identities and prevent fraud</li>
              <li>Provide customer support</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Location-Based Services</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Local Recommendations</h4>
                  <p className="text-yellow-700 text-sm">
                    We use your location data to show you items available in your area, calculate distances for meetups, 
                    and provide location-based search results. This improves your experience by showing relevant local content.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-4">Location data is used for:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Showing local items and sellers near you</li>
              <li>Proximity verification for secure transactions</li>
              <li>Calculating meetup distances and travel times</li>
              <li>Improving search results with location relevance</li>
              <li>Preventing fraudulent location claims</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Recommendation Engine</h3>
            <p className="text-gray-700 mb-4">We use your data to improve recommendations:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Analyze your browsing and purchase history</li>
              <li>Consider your location for local item suggestions</li>
              <li>Use your preferences and ratings to personalize content</li>
              <li>Identify trending items in your area</li>
              <li>Suggest similar products based on your interests</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 Transaction Monitoring</h3>
            <p className="text-gray-700 mb-4">We monitor transactions to ensure platform safety:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Track transaction completion and success rates</li>
              <li>Monitor for fraudulent or suspicious activity</li>
              <li>Verify proximity requirements for meetups</li>
              <li>Analyze dispute patterns and resolution outcomes</li>
              <li>Improve fraud detection algorithms</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 With Other Users</h3>
            <p className="text-gray-700 mb-4">We share limited information with other users:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Profile information (name, rating, location for meetups)</li>
              <li>Product listings and descriptions</li>
              <li>Transaction-related communications</li>
              <li>Location data for proximity verification (encrypted)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 With Service Providers</h3>
            <p className="text-gray-700 mb-4">We share information with trusted third parties:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Payment processors for transaction processing</li>
              <li>Banking partners for account verification</li>
              <li>Cloud storage providers for data hosting</li>
              <li>Analytics services for platform improvement</li>
              <li>Customer support tools for assistance</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Legal Requirements</h3>
            <p className="text-gray-700 mb-6">
              We may disclose information when required by law, to protect our rights, or to ensure user safety. 
              This includes responding to legal requests, preventing fraud, or protecting against security threats.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">We implement industry-standard security measures:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>End-to-end encryption for sensitive data</li>
              <li>Secure data transmission (HTTPS/TLS)</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Data backup and recovery systems</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights and Choices</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Access and Control</h3>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Access your personal information</li>
              <li>Update or correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of certain data collection</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Location Data Controls</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Location Privacy</h4>
                  <p className="text-blue-700 text-sm">
                    You can control location data collection through your device settings or our app preferences. 
                    Note that disabling location services may limit certain features like local item discovery and proximity verification.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Communication Preferences</h3>
            <p className="text-gray-700 mb-6">
              You can control how we communicate with you by updating your notification preferences in your account settings 
              or by unsubscribing from marketing emails.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 mb-4">We retain your information for different periods depending on the type:</p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Account information: Until you delete your account</li>
              <li>Transaction data: 7 years for tax and legal compliance</li>
              <li>Location data: 2 years for service improvement</li>
              <li>Communication logs: 1 year for support purposes</li>
              <li>Analytics data: Aggregated and anonymized after 2 years</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
            <p className="text-gray-700 mb-6">
              Our Service is not intended for children under 13. We do not knowingly collect personal information from 
              children under 13. If we become aware that we have collected such information, we will take steps to delete it.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Data Transfers</h2>
            <p className="text-gray-700 mb-6">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate 
              safeguards are in place to protect your data during such transfers.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any material changes via email 
              or through the Service. Your continued use of the Service after such changes constitutes acceptance of the updated policy.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                <strong>Privacy Officer:</strong> <a href="mailto:privacy@pacmacmobile.com" className="text-blue-600 hover:underline">privacy@pacmacmobile.com</a><br />
                <strong>Data Protection:</strong> <a href="mailto:dataprotection@pacmacmobile.com" className="text-blue-600 hover:underline">dataprotection@pacmacmobile.com</a><br />
                <strong>General Support:</strong> <a href="mailto:support@pacmacmobile.com" className="text-blue-600 hover:underline">support@pacmacmobile.com</a>
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <EyeIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Transparency Commitment</h3>
                  <p className="text-green-700 text-sm">
                    We believe in transparency about how we use your data. If you have any questions about our data practices 
                    or want to exercise your privacy rights, please don't hesitate to contact us. We're here to help.
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
