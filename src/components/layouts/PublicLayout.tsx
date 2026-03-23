import { Link, Outlet } from 'react-router-dom';
import { TrendingUp, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useTheme();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and nav links */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">EVA AI</span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link to="/how-it-works" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  How It Works
                </Link>
                <Link to="/setup" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Setup
                </Link>
                <Link to="/past-performance" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Past Performance
                </Link>
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black/40 z-40 top-16"
              onClick={closeMobileMenu}
            />
            <div className="md:hidden bg-white border-t border-gray-100 absolute top-16 left-0 right-0 z-50 shadow-lg">
              <div className="px-4 py-6 space-y-1">
                <Link
                  to="/how-it-works"
                  onClick={closeMobileMenu}
                  className="block text-gray-700 hover:text-blue-600 px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-gray-50"
                >
                  How It Works
                </Link>
                <Link
                  to="/setup"
                  onClick={closeMobileMenu}
                  className="block text-gray-700 hover:text-blue-600 px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-gray-50"
                >
                  Setup
                </Link>
                <Link
                  to="/past-performance"
                  onClick={closeMobileMenu}
                  className="block text-gray-700 hover:text-blue-600 px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-gray-50"
                >
                  Past Performance
                </Link>
                <div className="pt-4 border-t border-gray-100 space-y-1">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block text-gray-700 hover:text-gray-900 px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    className="block bg-blue-600 text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">EVA AI</h3>
              <p className="text-sm text-gray-500">
                Automated +EV betting system for Australian bookmakers.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
              <div className="space-y-2">
                <Link to="/terms" className="block text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Terms & Conditions
                </Link>
                <Link to="/privacy" className="block text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/risk-disclaimer" className="block text-sm text-gray-500 hover:text-blue-600 transition-colors">
                  Risk Disclaimer
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Important Notice</h3>
              <p className="text-xs text-gray-500">
                EVA AI does not hold funds, act as a bookmaker, or provide betting/financial advice.
                Past performance does not guarantee future returns.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} EVA AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
