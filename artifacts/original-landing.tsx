import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, BarChart3, Sparkles } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              WarmLoop
            </h1>
            <Link
              to="/auth"
              className="px-6 py-2 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-600">AI-Powered CRM</span>
          </div>
          
          <h2 
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Manage Leads with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-400">
              Intelligent Precision
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            WarmLoop is your lightweight CRM companion. Track leads, analyze pipelines, 
            and close deals with elegant simplicity. Built for teams who value speed and clarity.
          </p>

          <Link
            to="/auth"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-sky-400 text-white rounded-xl hover:bg-sky-500 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Lead Management
            </h3>
            <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Create, track, and manage all your leads in one place. Score contacts and prioritize your pipeline.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-sky-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Analytics Dashboard
            </h3>
            <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Visualize your pipeline with intuitive charts. Understand lead distribution and conversion patterns.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Smart Insights
            </h3>
            <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Get actionable metrics and KPIs at a glance. Make data-driven decisions with confidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
