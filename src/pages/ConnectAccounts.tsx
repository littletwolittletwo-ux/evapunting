import { useEffect, useState } from 'react';
import { CheckCircle2, Link as LinkIcon, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BOOKMAKERS } from '../types';

interface BookmakerConnection {
  id: string;
  bookmaker_name: string;
  username: string | null;
  status: string;
  balance: number;
}

export function ConnectAccounts() {
  const { user } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState<BookmakerConnection[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBookmaker, setSelectedBookmaker] = useState<typeof BOOKMAKERS[0] | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    depositAmount: '',
    screenshot: null as File | null,
    depositConfirmed: false,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadConnectedAccounts();
    }
  }, [user]);

  async function loadConnectedAccounts() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookmaker_connections')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setConnectedAccounts(data || []);
    } catch {
    } finally {
      setInitialLoading(false);
    }
  }

  function openModal(bookmaker: typeof BOOKMAKERS[0]) {
    setSelectedBookmaker(bookmaker);
    setShowModal(true);
    setFormData({
      email: '',
      username: '',
      password: '',
      depositAmount: '',
      screenshot: null,
      depositConfirmed: false,
    });
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedBookmaker) return;

    if (!formData.depositConfirmed) {
      setError('Please confirm you have deposited the recommended amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let screenshotUrl = null;

      if (formData.screenshot) {
        const fileExt = formData.screenshot.name.split('.').pop();
        const fileName = `${user.id}_${selectedBookmaker.name}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('bookmaker-screenshots')
          .upload(fileName, formData.screenshot);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('bookmaker-screenshots')
            .getPublicUrl(fileName);
          screenshotUrl = publicUrl;
        }
      }

      const depositAmount = formData.depositAmount ? parseFloat(formData.depositAmount) : selectedBookmaker.deposit;

      const { error: insertError } = await supabase
        .from('bookmaker_connections')
        .insert({
          user_id: user.id,
          bookmaker_name: selectedBookmaker.name as any,
          email: formData.email,
          username: formData.username || null,
          password: formData.password,
          deposit_amount: depositAmount,
          screenshot_url: screenshotUrl,
          deposit_confirmed: formData.depositConfirmed,
          status: 'pending',
          balance: depositAmount,
        });

      if (insertError) throw insertError;

      await loadConnectedAccounts();
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to connect account. Please try again.');
    } finally {
      setLoading(false);
    }
  }


  const getAccountStatus = (bookmakerName: string) =>
    connectedAccounts.find((acc) => acc.bookmaker_name === bookmakerName);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Connect Your Accounts
        </h1>
        <p className="text-gray-500 mb-8">
          Connect your bookmaker accounts to start automated betting. We'll manually integrate your
          credentials into our system within 1-2 business days.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BOOKMAKERS.map((bookmaker) => {
            const account = getAccountStatus(bookmaker.name);
            const connected = !!account;

            return (
              <div
                key={bookmaker.name}
                className={`
                  bg-white border rounded-xl shadow-sm p-6 transition-all
                  ${connected
                    ? 'border-l-4 border-l-green-600 border-t-gray-200 border-r-gray-200 border-b-gray-200'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{bookmaker.label}</h3>
                    <p className="text-sm text-gray-500">Recommended: ${bookmaker.deposit}</p>
                  </div>
                  {connected && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                </div>

                {connected ? (
                  <div>
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-500">Status</span>
                      <p
                        className={`text-sm font-semibold ${
                          account.status === 'connected'
                            ? 'text-green-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {account.status === 'connected' ? 'Active' : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Username</span>
                      <p className="text-sm text-gray-900">{account.username}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openModal(bookmaker)}
                    className="w-full px-4 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>Connect Account</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showModal && selectedBookmaker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-xl max-w-md w-full p-6 shadow-lg my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect {selectedBookmaker.label}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg
                    bg-white text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-blue-600
                    focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg
                    bg-white text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-blue-600
                    focus:border-transparent"
                  placeholder="Username (if applicable)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg
                    bg-white text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-blue-600
                    focus:border-transparent"
                  placeholder="Account password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder={selectedBookmaker.deposit.toString()}
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg
                      bg-white text-gray-900
                      focus:outline-none focus:ring-2 focus:ring-blue-600
                      focus:border-transparent"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Recommended: ${selectedBookmaker.deposit}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proof of Balance (Optional)
                </label>
                <label className="flex items-center justify-center px-4 py-3
                  border border-gray-300 rounded-lg cursor-pointer
                  hover:bg-gray-50 transition-colors bg-white">
                  <Upload className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {formData.screenshot ? formData.screenshot.name : 'Upload Screenshot'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setFormData({ ...formData, screenshot: e.target.files?.[0] || null })
                    }
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">Upload a screenshot showing your account balance</p>
              </div>

              <div className="flex items-start space-x-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <input
                  type="checkbox"
                  id="confirm"
                  checked={formData.depositConfirmed}
                  onChange={(e) => setFormData({ ...formData, depositConfirmed: e.target.checked })}
                  className="mt-1 accent-blue-600"
                />
                <label htmlFor="confirm" className="text-sm text-gray-700">
                  I confirm I have created and funded this account with ${selectedBookmaker.deposit} (or
                  similar) and authorise EVA AI to use my account for automated wagering according to the
                  service terms. EVA AI does not hold my funds.
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3
                    border border-gray-300 rounded-lg
                    text-gray-700 hover:bg-gray-50
                    font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
