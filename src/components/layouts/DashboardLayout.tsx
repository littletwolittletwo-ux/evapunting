import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, LayoutDashboard, Link as LinkIcon, User, LogOut, Shield, Menu, X, Sun, Moon, Coins, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ProfitTicker } from '../ProfitTicker';
import { useState } from 'react';

export function DashboardLayout() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700/50 z-50 flex items-center px-4 shadow-lg">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 shadow-md"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="ml-4 flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg blur opacity-75"></div>
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-white relative" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">EVA AI</span>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={closeSidebar}
        />
      )}

      <aside className={`w-64 bg-white dark:bg-gray-900/50 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800/50 flex flex-col fixed h-screen z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800/50">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition"></div>
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-white relative" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">EVA AI</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                onClick={closeSidebar}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive('/admin')
                    ? 'bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-500/20 dark:to-green-500/20 text-blue-700 dark:text-white border border-blue-300 dark:border-blue-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">Admin Panel</span>
              </Link>
              <Link
                to="/admin/profile"
                onClick={closeSidebar}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive('/admin/profile')
                    ? 'bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-500/20 dark:to-green-500/20 text-blue-700 dark:text-white border border-blue-300 dark:border-blue-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                onClick={closeSidebar}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-500/20 dark:to-green-500/20 text-blue-700 dark:text-white border border-blue-300 dark:border-blue-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                to="/connect-accounts"
                onClick={closeSidebar}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive('/connect-accounts')
                    ? 'bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-500/20 dark:to-green-500/20 text-blue-700 dark:text-white border border-blue-300 dark:border-blue-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <LinkIcon className="h-5 w-5" />
                <span className="font-medium">Connect Accounts</span>
              </Link>
              <Link
                to="/profile"
                onClick={closeSidebar}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive('/profile')
                    ? 'bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-500/20 dark:to-green-500/20 text-blue-700 dark:text-white border border-blue-300 dark:border-blue-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Profile</span>
              </Link>
              <Link
                to="/billing"
                onClick={closeSidebar}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive('/billing')
                    ? 'bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-500/20 dark:to-green-500/20 text-blue-700 dark:text-white border border-blue-300 dark:border-blue-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <Coins className="h-5 w-5" />
                <span className="font-medium">Billing</span>
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 space-y-3 border-t border-gray-200 dark:border-gray-800/50">
          <ProfitTicker />
          <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-all duration-200 border border-gray-300 dark:border-gray-700/50 hover:border-blue-400 dark:hover:border-blue-500/30"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 flex-1 border border-transparent hover:border-red-300 dark:hover:border-red-500/30"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto lg:ml-64 pt-16 lg:pt-0">
        {profile?.subscription_status === 'paused' && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/30 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Your account is paused due to an outstanding balance.
                </span>
              </div>
              <Link to="/billing" className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300">
                Pay Now →
              </Link>
            </div>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
