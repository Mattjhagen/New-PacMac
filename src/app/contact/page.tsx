'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const contactMethods = [
    {
      icon: ExclamationTriangleIcon,
      title: 'Disputes',
      description: 'Report transaction disputes, fraud, or account issues',
      contact: 'disputes@pacmacmobile.com',
      action: 'Email Disputes Team',
      color: 'bg-red-50 border-red-200 text-red-800',
      iconColor: 'text-red-600'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'General Support',
      description: 'General questions, account help, and technical support',
      contact: 'support@pacmacmobile.com',
      action: 'Email Support',
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      iconColor: 'text-blue-600'
    },
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      description: 'Call us for urgent issues or immediate assistance',
      contact: '402-302-2197',
      action: 'Call Now',
      color: 'bg-green-50 border-green-200 text-green-800',
      iconColor: 'text-green-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Legal & Privacy',
      description: 'Legal questions, privacy concerns, and data requests',
      contact: 'legal@pacmacmobile.com',
      action: 'Email Legal Team',
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      iconColor: 'text-purple-600'
    }
  ];

  const quickLinks = [
    {
      title: 'Terms of Service',
      description: 'Read our terms and conditions',
      href: '/terms',
      icon: '📋'
    },
    {
      title: 'Privacy Policy',
      description: 'Learn how we protect your data',
      href: '/privacy',
      icon: '🔒'
    },
    {
      title: 'Dispute Resolution',
      description: 'Create or track a dispute',
      href: '/disputes',
      icon: '⚖️'
    },
    {
      title: 'Bank Setup',
      description: 'Link your bank account or debit card',
      href: '/bank-setup',
      icon: '🏦'
    }
  ];

  if (submitted) {
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
                <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
                <p className="text-gray-600">We're here to help</p>
              </div>
            </div>
          </div>
        </header>

        {/* Success Message */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PaperAirplaneIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Another Message
            </button>
          </div>
        </main>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
              <p className="text-gray-600">We're here to help with any questions or concerns</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contact Methods */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactMethods.map((method, index) => (
              <div key={index} className={`border rounded-lg p-6 ${method.color}`}>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-white ${method.iconColor}`}>
                    <method.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                    <p className="text-sm mb-3 opacity-80">{method.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{method.contact}</span>
                      {method.title === 'Phone Support' ? (
                        <a
                          href={`tel:${method.contact}`}
                          className="px-3 py-1 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          {method.action}
                        </a>
                      ) : (
                        <a
                          href={`mailto:${method.contact}`}
                          className="px-3 py-1 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          {method.action}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General Question</option>
                  <option value="technical">Technical Support</option>
                  <option value="account">Account Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="dispute">Dispute</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please provide as much detail as possible..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="text-2xl mb-2">{link.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
                <p className="text-sm text-gray-600">{link.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I report a dispute?</h3>
              <p className="text-gray-600">
                You can create a dispute directly through our{' '}
                <Link href="/disputes" className="text-blue-600 hover:underline">Dispute Resolution Center</Link>
                {' '}or email us at{' '}
                <a href="mailto:disputes@pacmacmobile.com" className="text-blue-600 hover:underline">disputes@pacmacmobile.com</a>.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What information do I need for a dispute?</h3>
              <p className="text-gray-600">
                Please include your transaction ID, product details, description of the issue, and any supporting evidence 
                (photos, messages, etc.) when submitting a dispute.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does dispute resolution take?</h3>
              <p className="text-gray-600">
                Most disputes are resolved within 24-48 hours. Complex cases may take longer, but we'll keep you updated 
                throughout the process.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I call for urgent issues?</h3>
              <p className="text-gray-600">
                Yes! For urgent matters, you can call us at{' '}
                <a href="tel:402-302-2197" className="text-blue-600 hover:underline">402-302-2197</a>.
                {' '}Our phone support is available during business hours.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
