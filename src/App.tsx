import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PublicLayout } from './components/layouts/PublicLayout';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { HowItWorks } from './pages/HowItWorks';
import { Setup } from './pages/Setup';
import { PastPerformance } from './pages/PastPerformance';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { RiskDisclaimer } from './pages/RiskDisclaimer';
import { Dashboard } from './pages/Dashboard';
import { ConnectAccounts } from './pages/ConnectAccounts';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Billing } from './pages/Billing';
import { supabaseMisconfigured } from './lib/supabase';

function ConfigError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Configuration Error</h2>
        <p className="text-sm text-gray-600 mb-4">
          Missing required environment variables. Please set{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">VITE_SUPABASE_URL</code> and{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">VITE_SUPABASE_ANON_KEY</code>{' '}
          in your Vercel project settings.
        </p>
      </div>
    </div>
  );
}

function App() {
  if (supabaseMisconfigured) {
    return <ConfigError />;
  }

  return (
    <ErrorBoundary>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/past-performance" element={<PastPerformance />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/risk-disclaimer" element={<RiskDisclaimer />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/connect-accounts" element={<ConnectAccounts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/billing" element={<Billing />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Admin />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
