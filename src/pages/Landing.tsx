import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, BarChart3, Shield, Clock, Target, Receipt } from 'lucide-react';

export function Landing() {
  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Automated +EV Betting with <span className="text-blue-600">EVA AI</span>
            </h1>
            <p className="text-xl text-gray-500 mb-8 max-w-3xl mx-auto">
              Connect your Australian bookmaker accounts and let our intelligent system find and place
              profitable bets automatically. Track performance in real-time and maximize your returns.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link
                to="/signup"
                className="px-8 py-3 rounded-lg text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/how-it-works"
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Learn More
              </Link>
            </div>
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl max-w-2xl mx-auto">
              <p className="text-lg font-semibold text-gray-900 mb-2">Clear Pricing Structure</p>
              <p className="text-gray-700">
                <span className="font-bold text-gray-900">$50/month</span> subscription + <span className="font-bold text-green-600">30% commission</span> on wins only
              </p>
              <p className="text-sm text-gray-500 mt-2">Commission invoiced monthly. You keep 70% of all profits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose EVA AI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fully Automated</h3>
              <p className="text-gray-500">
                Our system monitors markets 24/7, finds positive expected value opportunities, and places bets
                automatically on your behalf.
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 border border-gray-200 hover:border-green-300 transition-all shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Tracking</h3>
              <p className="text-gray-500">
                Monitor your performance in real-time with detailed statistics, per-bookmaker breakdowns, and
                historical charts.
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Funds Stay Safe</h3>
              <p className="text-gray-500">
                We never hold your money. All funds remain in your own bookmaker accounts. We're simply an
                automation tool.
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">+EV Strategy</h3>
              <p className="text-gray-500">
                We only place bets with positive expected value, ensuring a mathematical edge over time across
                multiple bookmakers.
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 border border-gray-200 hover:border-green-300 transition-all shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
              <p className="text-gray-500">
                $50 monthly subscription plus 30% commission on profits only. Commission invoiced monthly based on your wins.
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-all shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Bookmakers</h3>
              <p className="text-gray-500">
                Works with Sportsbet, PointsBet, TAB, Neds, Ladbrokes, Betr, and Boombet for maximum
                opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 border border-gray-200">
            <div className="flex items-center justify-center mb-6">
              <Receipt className="h-12 w-12 text-blue-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-900">Pricing & Billing</h2>
            </div>
            <div className="space-y-6 text-center">
              <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
                <p className="text-2xl font-bold text-gray-900 mb-2">Monthly Subscription</p>
                <p className="text-4xl font-extrabold text-blue-600">$50</p>
                <p className="text-gray-500 mt-2">Billed monthly for access to our automated betting system</p>
              </div>
              <div className="text-2xl font-bold text-gray-900">+</div>
              <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                <p className="text-2xl font-bold text-gray-900 mb-2">Performance Commission</p>
                <p className="text-4xl font-extrabold text-green-600">30%</p>
                <p className="text-gray-500 mt-2">Of your winning bets only - invoiced monthly</p>
                <p className="text-sm text-gray-500 mt-3">You keep 70% of all profits generated</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-gray-900 font-semibold">How it works:</p>
                <p className="text-gray-500 text-sm mt-2">
                  Pay $50 monthly subscription. At the end of each month, we calculate your total wins and invoice you for 30% commission on those wins only. No wins = no commission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimers Section */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-xl p-8 md:p-12 border border-gray-200">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Important Disclaimers</h2>
            <div className="space-y-4 max-w-3xl mx-auto text-gray-500">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>EVA AI does not hold funds or act as a bookmaker.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>We do not provide betting or financial advice.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>All funds remain in your own bookmaker accounts at all times.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>EVA AI is an automation and service tool for managing your betting strategy.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Past performance does not guarantee future returns.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="font-semibold text-gray-900">Billing: $50 monthly subscription + 30% commission invoiced monthly on winning bets only.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
            Join EVA AI today and start automating your betting strategy with our intelligent system.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 rounded-lg text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
