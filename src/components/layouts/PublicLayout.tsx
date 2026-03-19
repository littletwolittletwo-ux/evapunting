import { Link, Outlet } from 'react-router-dom';
import { TrendingUp, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
                  <TrendingUp className="h-8 w-8 text-blue-600 dark:text-white relative" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">EVA AI</span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link to="/how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                  How It Works
                </Link>
                <Link to="/setup" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors">
                  Setup
                </Link>
                <Link to="/past-performance" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors">
                  Past Performance
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors">
                Login
              </Link>
              <Link
                to="/signup"
                className="relative px-4 py-2 rounded-lg text-sm font-medium text-white overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 transition-transform group-hover:scale-105"></div>
                <span className="relative">Get Started</span>
              </Link>
            </div>
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 top-16"
              onClick={closeMobileMenu}
            />
            <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 absolute top-16 left-0 right-0 z-50 shadow-xl">
              <div className="px-4 py-6 space-y-3">
                <Link
                  to="/how-it-works"
                  onClick={closeMobileMenu}
                  className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  How It Works
                </Link>
                <Link
                  to="/setup"
                  onClick={closeMobileMenu}
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Setup
                </Link>
                <Link
                  to="/past-performance"
                  onClick={closeMobileMenu}
                  className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Past Performance
                </Link>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    className="block relative px-4 py-3 rounded-lg text-base font-medium text-white overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 transition-transform group-hover:scale-105"></div>
                    <span className="relative">Get Started</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
      <footer className="bg-gray-50 dark:bg-gray-900/50 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">EVA AI</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automated +EV betting system for Australian bookmakers.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal</h3>
              <div className="space-y-2">
                <Link to="/terms" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
                <Link to="/privacy" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/risk-disclaimer" className="block text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  Risk Disclaimer
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Important Notice</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                EVA AI does not hold funds, act as a bookmaker, or provide betting/financial advice.
                Past performance does not guarantee future returns.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} EVA AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
