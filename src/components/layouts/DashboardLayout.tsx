import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, LayoutDashboard, Link as LinkIcon, User, LogOut, Shield, Menu, X, Coins, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ProfitTicker } from '../ProfitTicker';
import { useState } from 'react';

export function DashboardLayout() {
  const { user, profile, signOut, isAdmin } = useAuth();
  useTheme();
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

  const navLinkClass = (path: string) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive(path)
        ? 'border-l-4 border-blue-600 bg-blue-50 text-blue-700 font-semibold'
        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center px-4 shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-200"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="ml-4 flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold text-blue-600">EVA AI</span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col fixed h-screen z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-blue-600">EVA AI</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                onClick={closeSidebar}
                className={navLinkClass('/admin')}
              >
                <Shield className="h-5 w-5" />
                <span>Admin Panel</span>
              </Link>
              <Link
                to="/admin/profile"
                onClick={closeSidebar}
                className={navLinkClass('/admin/profile')}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                onClick={closeSidebar}
                className={navLinkClass('/dashboard')}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/connect-accounts"
                onClick={closeSidebar}
                className={navLinkClass('/connect-accounts')}
              >
                <LinkIcon className="h-5 w-5" />
                <span>Connect Accounts</span>
              </Link>
              <Link
                to="/profile"
                onClick={closeSidebar}
                className={navLinkClass('/profile')}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <Link
                to="/billing"
                onClick={closeSidebar}
                className={navLinkClass('/billing')}
              >
                <Coins className="h-5 w-5" />
                <span>Billing</span>
              </Link>
            </>
          )}
        </nav>

        {/* Bottom section */}
        <div className="p-4 space-y-3 border-t border-gray-200">
          <ProfitTicker />
          <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent hover:border-red-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto lg:ml-64 pt-16 lg:pt-0">
        {profile?.subscription_status === 'paused' && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  Your account is paused due to an outstanding balance.
                </span>
              </div>
              <Link to="/billing" className="text-sm font-semibold text-amber-600 hover:text-amber-700">
                Pay Now &rarr;
              </Link>
            </div>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
