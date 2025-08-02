import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                TimeBank
              </span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-purple-600 transition-colors">Home</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-colors">How It Works</a>
              <a href="#skills" className="text-gray-700 hover:text-purple-600 transition-colors">Skills</a>
              <Link to="/about" className="text-gray-700 hover:text-purple-600 transition-colors">About Us</Link>
              <Link to="/support" className="text-gray-700 hover:text-purple-600 transition-colors">Support</Link>
              <Link 
                to="/auth" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                Account
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Trade Time,
              </span>
              <br />
              <span className="text-gray-800">Not Money</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Share your skills. Earn time credits. Redeem them for help from others. 
              Empower your community through meaningful time exchange.
            </p>
            
            <Link 
              to="/auth"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Simple steps to start exchanging time</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Offer Your Skill</h3>
              <p className="text-gray-600">Teach Python, help with design, or share any skill you have</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Earn Time Credits</h3>
              <p className="text-gray-600">Get credits based on hours you contribute to help others</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Learn From Others</h3>
              <p className="text-gray-600">Spend credits to learn new skills or receive help</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-purple-600 font-semibold">
              <Star className="inline h-5 w-5 mr-2" />
              Everyone's time is equally valuable
            </p>
          </div>
        </div>
      </section>

      {/* Why TimeBank Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why TimeBank?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4 p-6">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Inclusive</h3>
                <p className="text-gray-600">No money involved, only time. Everyone can participate regardless of financial status.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-6">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Flexible</h3>
                <p className="text-gray-600">Learn and share at your own pace. Schedule sessions that work for you.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-6">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Trustworthy</h3>
                <p className="text-gray-600">Verified users and comprehensive feedback system ensure quality exchanges.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills Section */}
      <section id="skills" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Featured Skills
            </h2>
            <p className="text-xl text-gray-600">Popular skills being exchanged on TimeBank</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {['Coding', 'Design', 'Fitness', 'Music', 'Resume Review', 'Languages', 'Public Speaking'].map((skill) => (
              <span 
                key={skill}
                className="px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full font-medium hover:from-purple-200 hover:to-blue-200 transition-colors cursor-pointer"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to exchange your time?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of learners and teachers building a stronger community together.
            </p>
            <Link 
              to="/auth"
              className="inline-flex items-center space-x-2 bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <span>Join TimeBank Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Clock className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold">TimeBank</span>
          </div>
          
          <div className="text-center text-gray-400">
            <p>&copy; 2025 TimeBank | Built by Students for Students</p>
            <div className="mt-4 space-x-6">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}