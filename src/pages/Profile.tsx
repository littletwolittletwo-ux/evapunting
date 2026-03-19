import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Clock, CreditCard, Pause, Trash2 } from 'lucide-react';

export function Profile() {
  const { user, profile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !user) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName, phone })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePause() {
    if (!user) return;
    try {
      const { error: pauseError } = await supabase
        .from('user_profiles')
        .update({ subscription_status: 'paused' as const })
        .eq('id', user.id);
      if (pauseError) throw pauseError;
      setShowPauseModal(false);
      window.location.reload();
    } catch (err) {
      setError('Failed to pause account. Please try again.');
      setShowPauseModal(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    try {
      const { error: deleteError } = await supabase
        .from('user_profiles')
        .update({ subscription_status: 'cancelled' as const })
        .eq('id', user.id);
      if (deleteError) throw deleteError;
      setShowDeleteModal(false);
      await signOut();
    } catch (err) {
      setError('Failed to delete account. Please try again.');
      setShowDeleteModal(false);
    }
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent dark:text-white mb-8">Profile Settings</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="bg-green-500/10 border border-green-600/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm backdrop-blur-xl">
                Profile updated successfully!
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm backdrop-blur-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  cursor-not-allowed backdrop-blur-xl"
              />
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-green-500
                  focus:border-transparent backdrop-blur-xl transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-green-500
                  focus:border-transparent backdrop-blur-xl transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Created</label>
              <input
                type="text"
                value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  cursor-not-allowed backdrop-blur-xl"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="relative w-full px-4 py-3 rounded-lg font-medium text-white overflow-hidden group disabled:opacity-50 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-600 transition-transform group-hover:scale-105"></div>
                <span className="relative">{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Identity Verification</h3>
            {profile?.kyc_verified ? (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Identity Verified</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Clock className="h-5 w-5" />
                <span>Pending Verification</span>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</h3>
            {profile?.stripe_payment_method_id ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <CreditCard className="h-5 w-5" />
                  <span>Card ending in ****{profile.stripe_payment_method_id.slice(-4)}</span>
                </div>
                <Link to="/billing" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                  Update Card
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400 text-sm">No payment method on file</span>
                <Link to="/billing" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                  Add Card
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Controls</h3>

            {profile?.subscription_status !== 'paused' && profile?.subscription_status !== 'cancelled' && (
              <div className="flex items-center justify-between p-4 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 mb-4">
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">Pause Betting</p>
                  <p className="text-sm text-amber-600 dark:text-amber-300/70">Temporarily stop all automated betting</p>
                </div>
                <button onClick={() => setShowPauseModal(true)} className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium">
                  <Pause className="h-4 w-4 inline mr-1" /> Pause
                </button>
              </div>
            )}

            {profile?.subscription_status === 'paused' && (
              <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 mb-4">
                <p className="font-medium text-amber-700 dark:text-amber-400">Account is paused</p>
                <p className="text-sm text-amber-600 dark:text-amber-300/70 mb-2">Your automated betting is currently paused.</p>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Delete Account</p>
                <p className="text-sm text-red-600 dark:text-red-300/70">Permanently cancel your EVA subscription</p>
              </div>
              <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                <Trash2 className="h-4 w-4 inline mr-1" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Pause Betting?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This will temporarily stop all automated betting on your account. You can resume at any time from your profile or billing page.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPauseModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePause}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
              >
                Confirm Pause
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This will permanently cancel your EVA subscription and sign you out. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
