import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Target, Heart, Lightbulb, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
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
            About TimeBank
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We believe everyone has something valuable to offer. TimeBank is a peer-to-peer 
            skill-sharing platform where users trade time instead of money.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="h-8 w-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
          </div>
          <p className="text-lg text-gray-600 leading-relaxed">
            To create a world where skills are accessible, community is strong, and time is the most valued currency.
          </p>
        </div>

        {/* Why We Built This */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Heart className="h-8 w-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Why We Built This</h2>
          </div>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <p>To democratize learning and mentorship</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <p>To build connections across campuses and communities</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <p>To allow anyone, regardless of financial status, to learn and grow</p>
            </div>
          </div>
        </div>

        {/* Vision */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Lightbulb className="h-8 w-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Our Vision</h2>
          </div>
          <p className="text-lg text-gray-600 leading-relaxed">
            Imagine a world where teaching guitar for an hour gets you a coding lesson in return. 
            That's TimeBank - where every skill has value and every hour counts.
          </p>
        </div>

        {/* Team */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Meet the Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">A</span>
              </div>
              <h3 className="font-semibold text-gray-800">Alex Johnson</h3>
              <p className="text-gray-600">Backend & API</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">S</span>
              </div>
              <h3 className="font-semibold text-gray-800">Sarah Chen</h3>
              <p className="text-gray-600">Frontend & UX</p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">M</span>
              </div>
              <h3 className="font-semibold text-gray-800">Marcus Rivera</h3>
              <p className="text-gray-600">Data & Operations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}