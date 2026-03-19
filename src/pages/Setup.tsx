import { Link } from 'react-router-dom';
import { ExternalLink, Sparkles } from 'lucide-react';
import { BOOKMAKERS } from '../types';

export function Setup() {
  return (
    <div className="py-16 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-green-600 dark:from-blue-500 dark:via-blue-400 dark:to-green-500 bg-clip-text text-transparent mb-4">
            Setup Your Bookmaker Accounts
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            To get started with EVA AI, you'll need to create accounts with the following bookmakers and fund
            them with the recommended amounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {BOOKMAKERS.map((bookmaker, index) => (
            <div
              key={bookmaker.name}
              className="group relative bg-white dark:bg-gray-800/30 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700/50 hover:border-blue-600/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{bookmaker.label}</h3>
                  <div className="p-2 bg-blue-500/10 dark:bg-blue-500/10 rounded-lg border border-blue-500/30 dark:border-blue-500/30 group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/20 transition-colors">
                    <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Recommended Deposit</span>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 bg-clip-text text-transparent">
                    ${bookmaker.deposit}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Create an account and fund it with the recommended amount to maximize betting opportunities.
                </p>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-500" />
                    You'll connect this account after signup
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 backdrop-blur-xl rounded-xl p-8 mb-12 border border-gray-200 dark:border-blue-500/20 shadow-lg dark:shadow-lg dark:shadow-blue-500/10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-500 dark:to-green-500 bg-clip-text text-transparent mb-4">
            Important Setup Notes
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-500 dark:to-green-500 rounded-full mt-2 flex-shrink-0 shadow-lg"></div>
                <p>
                  {index === 0 && "The recommended deposits are optimized for best performance but not mandatory. You can adjust based on your budget."}
                  {index === 1 && "All funds remain in your own bookmaker accounts. EVA AI never holds or transfers your money."}
                  {index === 2 && "After creating and funding your accounts, you'll connect them through the EVA AI dashboard."}
                  {index === 3 && "You don't need to create all accounts at once. Start with a few and add more later."}
                  {index === 4 && "Once connected, our system takes 1-2 business days to fully integrate your accounts."}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative bg-white dark:bg-gray-800/30 backdrop-blur-xl rounded-xl p-8 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-full blur-3xl"></div>
          <div className="relative">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-500 dark:to-green-500 bg-clip-text text-transparent mb-4">
              Total Investment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              To use all 7 bookmakers with recommended deposits:
            </p>
            <div className="text-5xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-blue-600 dark:from-green-500 dark:via-green-400 dark:to-blue-500 bg-clip-text text-transparent mb-2">
              ${BOOKMAKERS.reduce((sum, b) => sum + b.deposit, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This amount stays in your accounts. Start with fewer bookmakers if preferred.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/signup"
            className="relative inline-block px-8 py-3 rounded-lg text-lg font-semibold text-white dark:text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300 overflow-hidden group"
          >
            <span className="relative">Create Your EVA AI Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}