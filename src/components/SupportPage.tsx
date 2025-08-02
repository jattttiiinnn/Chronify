import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mail, MessageCircle, Send, ArrowLeft, HelpCircle } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                TimeBank
              </span>
            </Link>
            
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Need Help? We're Here For You.
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions or get in touch with our team.
          </p>
        </div>

        {/* Common Questions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-12">
          <div className="flex items-center space-x-3 mb-8">
            <HelpCircle className="h-8 w-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Common Questions</h2>
          </div>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Is it free to use TimeBank?
              </h3>
              <p className="text-gray-600">
                Yes! TimeBank is 100% free. All you need is your time and willingness to contribute.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                How do I earn time credits?
              </h3>
              <p className="text-gray-600">
                Help someone out, log your hours, and credits are added to your wallet automatically when you complete a session.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                What if someone doesn't show up?
              </h3>
              <p className="text-gray-600">
                We have a community reputation system. You can report no-shows and rate interactions to help maintain quality.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                How do I schedule a session?
              </h3>
              <p className="text-gray-600">
                Browse available skills, select a provider, choose a time that works for both of you, and optionally add a Google Meet link for virtual sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Us */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Contact Us</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Email</h3>
                  <a href="mailto:support@timebank.in" className="text-purple-600 hover:underline">
                    support@timebank.in
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Instagram</h3>
                  <a href="#" className="text-purple-600 hover:underline">
                    @timebank.app
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Telegram Group</h3>
                  <a href="#" className="text-purple-600 hover:underline">
                    Join our community
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Send us feedback</h3>
              <a 
                href="#" 
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                <Send className="h-5 w-5" />
                <span>Open Feedback Form</span>
              </a>
            </div>
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Community Guidelines</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-gray-700">Be respectful to all community members</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-gray-700">Be punctual for scheduled sessions</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-gray-700">Offer real value in your sessions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-gray-700">Report any misuse or inappropriate behavior</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}