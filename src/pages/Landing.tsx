import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, BarChart3, Shield, Clock, Target, Receipt } from 'lucide-react';

export function Landing() {
  return (
    <div>
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-green-600 dark:from-white dark:via-blue-400 dark:to-green-400 bg-clip-text text-transparent mb-6 animate-gradient">
              Automated +EV Betting with EVA AI
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Connect your Australian bookmaker accounts and let our intelligent system find and place
              profitable bets automatically. Track performance in real-time and maximize your returns.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link
                to="/signup"
                className="relative px-8 py-3 rounded-lg text-lg font-semibold text-white overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 transition-transform group-hover:scale-105"></div>
                <span className="relative">Get Started</span>
              </Link>
              <Link
                to="/how-it-works"
                className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white border-2 border-blue-500/50 px-8 py-3 rounded-lg text-lg font-semibold transition-all"
              >
                Learn More
              </Link>
            </div>
            <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl max-w-2xl mx-auto backdrop-blur-xl">
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Clear Pricing Structure</p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-bold text-gray-900 dark:text-white">$50/month</span> subscription + <span className="font-bold text-green-600 dark:text-green-400">30% commission</span> on wins only
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Commission invoiced monthly. You keep 70% of all profits.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-900 via-blue-600 to-green-600 dark:from-white dark:via-blue-400 dark:to-green-400 bg-clip-text text-transparent mb-12">Why Choose EVA AI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-all shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-full mb-4 border border-gray-300 dark:border-white/30">
                <Clock className="h-8 w-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fully Automated</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our system monitors markets 24/7, finds positive expected value opportunities, and places bets
                automatically on your behalf.
              </p>
            </div>

            <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 transition-all shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-full mb-4 border border-green-200 dark:border-green-500/30">
                <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Live Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor your performance in real-time with detailed statistics, per-bookmaker breakdowns, and
                historical charts.
              </p>
            </div>

            <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full mb-4 border border-blue-200 dark:border-blue-500/30">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your Funds Stay Safe</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We never hold your money. All funds remain in your own bookmaker accounts. We're simply an
                automation tool.
              </p>
            </div>

            <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full mb-4 border border-blue-200 dark:border-blue-500/30">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">+EV Strategy</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We only place bets with positive expected value, ensuring a mathematical edge over time across
                multiple bookmakers.
              </p>
            </div>

            <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 transition-all shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-full mb-4 border border-green-200 dark:border-green-500/30">
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Transparent Pricing</h3>
              <p className="text-gray-600 dark:text-gray-400">
                $50 monthly subscription plus 30% commission on profits only. Commission invoiced monthly based on your wins.
              </p>
            </div>

            <div className="text-center bg-white dark:bg-gray-800/30 backdrop-blur-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 hover:border-gray-400 dark:hover:border-white/50 transition-all shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-full mb-4 border border-gray-300 dark:border-white/30">
                <TrendingUp className="h-8 w-8 text-gray-900 dark:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Multiple Bookmakers</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Works with Sportsbet, PointsBet, TAB, Neds, Ladbrokes, Betr, and Boombet for maximum
                opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-white via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 backdrop-blur-xl rounded-xl shadow-2xl p-8 md:p-12 border border-blue-500/50">
            <div className="flex items-center justify-center mb-6">
              <Receipt className="h-12 w-12 text-gray-900 dark:text-white mr-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Pricing & Billing</h2>
            </div>
            <div className="space-y-6 text-center">
              <div className="bg-white dark:bg-gray-900/50 rounded-lg p-6 border border-gray-200 dark:border-white/20">
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Monthly Subscription</p>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">$50</p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Billed monthly for access to our automated betting system</p>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">+</div>
              <div className="bg-white dark:bg-gray-900/50 rounded-lg p-6 border border-green-500/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Performance Commission</p>
                <p className="text-4xl font-extrabold text-green-600 dark:text-green-400">30%</p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Of your winning bets only - invoiced monthly</p>
                <p className="text-sm text-gray-500 mt-3">You keep 70% of all profits generated</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
                <p className="text-gray-900 dark:text-white font-semibold">How it works:</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">
                  Pay $50 monthly subscription. At the end of each month, we calculate your total wins and invoice you for 30% commission on those wins only. No wins = no commission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800/30 backdrop-blur-xl rounded-xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-blue-500/50">
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-900 via-blue-600 to-green-600 dark:from-white dark:via-blue-400 dark:to-green-400 bg-clip-text text-transparent mb-6">Important Disclaimers</h2>
            <div className="space-y-4 max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>EVA AI does not hold funds or act as a bookmaker.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>We do not provide betting or financial advice.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>All funds remain in your own bookmaker accounts at all times.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>EVA AI is an automation and service tool for managing your betting strategy.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>Past performance does not guarantee future returns.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="font-semibold text-gray-900 dark:text-white">Billing: $50 monthly subscription + 30% commission invoiced monthly on winning bets only.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-green-600 dark:from-white dark:via-blue-400 dark:to-green-400 bg-clip-text text-transparent mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join EVA AI today and start automating your betting strategy with our intelligent system.
          </p>
          <Link
            to="/signup"
            className="relative inline-block px-8 py-3 rounded-lg text-lg font-semibold text-white overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 transition-transform group-hover:scale-105"></div>
            <span className="relative">Create Your Account</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
