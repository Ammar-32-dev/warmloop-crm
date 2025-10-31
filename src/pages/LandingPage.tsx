import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Users, 
  BarChart3, 
  Sparkles, 
  Target,
  Zap,
  FileUp,
  TrendingUp,
  CheckCircle2,
  Star,
  Twitter,
  Github,
  Linkedin,
  Mail,
  Play
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      quote: "WarmLoop transformed how we manage our pipeline. Lead scoring is incredibly accurate and saves us hours every week.",
      author: "Sarah Chen",
      role: "VP of Sales",
      company: "TechFlow Inc"
    },
    {
      quote: "The AI insights are game-changing. We increased our conversion rate by 40% in just two months.",
      author: "Michael Rodriguez",
      role: "Founder",
      company: "GrowthLabs"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-white/80 border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              WarmLoop
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                to="/auth"
                className="px-6 py-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200 font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
                aria-label="Get started with WarmLoop"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                AI-Powered CRM
              </span>
            </div>
            
            <h2 
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              WarmLoop — Smart CRM that remembers, recommends, and closes
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              AI-assisted lead scoring, instant insights, and a clean pipeline — built for busy founders and sales teams.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                to="/auth"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                style={{ fontFamily: 'Inter, sans-serif' }}
                aria-label="Get started for free"
              >
                <span>Get started — it's free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <button
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 text-lg font-semibold"
                style={{ fontFamily: 'Inter, sans-serif' }}
                aria-label="Watch demo video"
              >
                <Play className="w-5 h-5" />
                <span>See demo</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-6">
              <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                Trusted by 100+ sales teams
              </p>
              <div className="flex items-center space-x-3">
                {/* Placeholder Logo SVGs */}
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard Mockup */}
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-600 to-sky-400 rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="bg-white rounded-lg p-6 -rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div className="h-3 w-24 bg-indigo-200 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                  
                  {/* Mock dashboard cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <div className="h-2 w-16 bg-indigo-200 rounded mb-2"></div>
                      <div className="h-6 w-12 bg-indigo-600 rounded"></div>
                    </div>
                    <div className="bg-sky-50 rounded-lg p-4">
                      <div className="h-2 w-16 bg-sky-200 rounded mb-2"></div>
                      <div className="h-6 w-12 bg-sky-400 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Mock chart */}
                  <div className="h-32 bg-gradient-to-t from-indigo-100 to-transparent rounded-lg flex items-end justify-between px-2 pb-2 space-x-1">
                    <div className="w-8 bg-indigo-400 rounded-t" style={{ height: '40%' }}></div>
                    <div className="w-8 bg-indigo-500 rounded-t" style={{ height: '60%' }}></div>
                    <div className="w-8 bg-indigo-600 rounded-t" style={{ height: '80%' }}></div>
                    <div className="w-8 bg-sky-400 rounded-t" style={{ height: '70%' }}></div>
                    <div className="w-8 bg-sky-500 rounded-t" style={{ height: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Lead Scoring */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-600 to-sky-400"></div>
            <div className="p-8">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Lead Scoring
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                AI-powered scoring algorithm analyzes every lead and surfaces the hottest opportunities automatically.
              </p>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-sky-400 to-indigo-600"></div>
            <div className="p-8">
              <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-sky-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                AI Insights
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Get intelligent recommendations on which leads to prioritize and when to follow up for maximum conversion.
              </p>
            </div>
          </div>

          {/* Fast Import & Analyze */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-600 to-sky-400"></div>
            <div className="p-8">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <FileUp className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Fast Import & Analyze
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Import your leads from CSV, Excel, or any format. Get instant analytics and actionable insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              How It Works
            </h2>
            <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Three simple steps to transform your sales pipeline
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1: Import */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                1. Import
              </h3>
              <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                Upload your leads from any source. CSV, Excel, or manual entry — we handle it all seamlessly.
              </p>
            </div>

            {/* Step 2: Score */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                2. Score
              </h3>
              <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                Our AI analyzes every lead and assigns smart scores based on engagement and potential value.
              </p>
            </div>

            {/* Step 3: Close */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                3. Close
              </h3>
              <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                Focus on high-value leads with AI-powered insights. Follow up at the perfect time to close deals faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-indigo-600 to-sky-400 rounded-3xl p-12 text-center shadow-2xl">
          <h2 
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            See WarmLoop in Action
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Experience the power of AI-assisted CRM. Try our interactive demo and see how easy it is to manage your pipeline.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center space-x-2 px-10 py-5 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            style={{ fontFamily: 'Inter, sans-serif' }}
            aria-label="Try the interactive demo"
          >
            <Play className="w-6 h-6" />
            <span>Try Demo Now</span>
          </Link>
        </div>
      </section>

      {/* Testimonials & Trust */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Loved by Sales Teams
            </h2>
            <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Join hundreds of teams who close more deals with WarmLoop
            </p>
          </div>

          {/* Testimonial Carousel */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-10">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl text-gray-700 text-center mb-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                "{testimonials[activeTestimonial].quote}"
              </blockquote>
              <div className="text-center">
                <p className="font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {testimonials[activeTestimonial].author}
                </p>
                <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {testimonials[activeTestimonial].role} at {testimonials[activeTestimonial].company}
                </p>
              </div>
              
              {/* Carousel Indicators */}
              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === activeTestimonial ? 'bg-indigo-600 w-8' : 'bg-gray-300'
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Logo Strip */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Trusted by leading companies
            </p>
            <div className="flex justify-center items-center space-x-8 flex-wrap gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                  <svg className="w-12 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            Choose the plan that fits your team
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Free
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                $0
              </span>
              <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                /month
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Up to 100 leads
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Basic lead scoring
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  CSV import
                </span>
              </li>
            </ul>
            <Link
              to="/auth"
              className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-semibold"
              style={{ fontFamily: 'Inter, sans-serif' }}
              aria-label="Get started with Free plan"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-indigo-600 relative transform scale-105">
            <div className="absolute top-0 right-6 -translate-y-1/2">
              <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                Popular
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Pro
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                $49
              </span>
              <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                /month
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Up to 1,000 leads
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Advanced AI scoring
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Priority support
                </span>
              </li>
            </ul>
            <Link
              to="/auth"
              className="block w-full text-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-semibold shadow-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
              aria-label="Get started with Pro plan"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Team Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Team
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                $99
              </span>
              <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                /month
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Unlimited leads
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Team collaboration
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Dedicated account manager
                </span>
              </li>
            </ul>
            <a
              href="mailto:sales@warmloop.io"
              className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-semibold"
              style={{ fontFamily: 'Inter, sans-serif' }}
              aria-label="Contact sales for Team plan"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand Column */}
            <div>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                WarmLoop
              </h3>
              <p className="text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                Smart CRM that remembers, recommends, and closes.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/auth" className="text-gray-400 hover:text-white transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-gray-400 hover:text-white transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-gray-400 hover:text-white transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Docs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/auth" className="text-gray-400 hover:text-white transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-gray-400 hover:text-white transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-gray-400 hover:text-white transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Connect
              </h4>
              <div className="flex space-x-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                  <Github className="w-6 h-6" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="mailto:hello@warmloop.io" className="text-gray-400 hover:text-white transition-colors" aria-label="Email">
                  <Mail className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              2025 WarmLoop. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
