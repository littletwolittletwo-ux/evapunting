import { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Receipt,
  Settings,
  Wallet,
  RefreshCw,
  ArrowUpDown,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BookmakerConnection {
  id: string;
  user_id: string;
  bookmaker_name: string;
  username: string | null;
  email: string | null;
  password: string | null;
  status: string;
  deposit_amount: number | null;
  screenshot_url: string | null;
  deposit_confirmed: boolean | null;
  created_at: string;
  balance: number;
  net_profit_week: number;
  net_profit_alltime: number;
  last_synced_at: string | null;
  connected_at: string | null;
}

interface UserWithAccounts {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  token_debt: number | null;
  kyc_verified: boolean;
  accounts: BookmakerConnection[];
}

interface BillingCycle {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  gross_profit: number;
  token_debt: number;
  amount_aud: number;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  status: string;
  created_at: string;
}

type TabKey = 'users' | 'billing' | 'apiconfig' | 'balances';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAUD(value: number | null | undefined): string {
  if (value == null) return '$0.00';
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatWeekRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date, weekday: boolean) => {
    const parts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    if (weekday) parts.weekday = 'short';
    return d.toLocaleDateString('en-AU', parts);
  };
  return `${fmt(s, true)} – ${fmt(e, true)}`;
}

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-300 dark:border-green-500/30',
    pending: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30',
    failed: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/30',
    waived: 'bg-gray-100 dark:bg-gray-600/20 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/30',
    connected: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-300 dark:border-green-500/30',
    error: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/30',
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Pagination component (reused across tabs)
// ---------------------------------------------------------------------------

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems === 0) return null;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startIndex} to {endIndex} of {totalItems}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              if (totalPages <= 7) return true;
              if (page === 1 || page === totalPages) return true;
              if (page >= currentPage - 1 && page <= currentPage + 1) return true;
              return false;
            })
            .map((page, index, array) => {
              const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
              return (
                <div key={page} className="flex items-center space-x-1">
                  {showEllipsisBefore && (
                    <span className="px-2 text-gray-400 dark:text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(page)}
                    className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg shadow-blue-500/50 dark:shadow-blue-600/50'
                        : 'bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                </div>
              );
            })}
        </div>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 1 — Users
// ---------------------------------------------------------------------------

function UsersTab() {
  const [users, setUsers] = useState<UserWithAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithAccounts | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'awaiting' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [syncingUserId, setSyncingUserId] = useState<string | null>(null);
  const [togglingKycId, setTogglingKycId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      let profilesQuery = supabase.from('user_profiles').select('*', { count: 'exact' });

      if (searchQuery.trim()) {
        profilesQuery = profilesQuery.or(
          `email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`
        );
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data: profiles, error: profilesError, count } = await profilesQuery
        .order('created_at', { ascending: false })
        .range(from, to);

      if (profilesError) {
        setLoading(false);
        return;
      }

      setTotalUsers(count || 0);

      if (!profiles || profiles.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const userIds = profiles.map((p) => p.id);
      const { data: connections } = await supabase
        .from('bookmaker_connections')
        .select('*')
        .in('user_id', userIds);

      const usersWithAccounts: UserWithAccounts[] = profiles.map((profile) => {
        const userConnections = connections?.filter((c) => c.user_id === profile.id) || [];
        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name || null,
          created_at: profile.created_at,
          token_debt: profile.token_debt ?? null,
          kyc_verified: profile.kyc_verified ?? false,
          accounts: userConnections,
        };
      });

      setUsers(usersWithAccounts);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, itemsPerPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function updateAccountStatus(accountId: string, status: 'pending' | 'connected') {
    try {
      const { error } = await supabase
        .from('bookmaker_connections')
        .update({ status })
        .eq('id', accountId);
      if (error) throw error;

      if (selectedUser) {
        const updatedAccounts = selectedUser.accounts.map((acc) =>
          acc.id === accountId ? { ...acc, status } : acc
        );
        setSelectedUser({ ...selectedUser, accounts: updatedAccounts });
      }
      await loadUsers();
    } catch (error) {
    }
  }

  async function handleForceSync(userId: string) {
    setSyncingUserId(userId);
    try {
      const { error } = await supabase.functions.invoke('sync-user-balances', {
        body: { user_id: userId },
      });
      if (error) throw error;
      await loadUsers();
    } catch (error) {
    } finally {
      setSyncingUserId(null);
    }
  }

  async function handleKycToggle(userId: string, currentValue: boolean) {
    setTogglingKycId(userId);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ kyc_verified: !currentValue })
        .eq('id', userId);
      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, kyc_verified: !currentValue } : u))
      );

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, kyc_verified: !currentValue });
      }
    } catch (error) {
    } finally {
      setTogglingKycId(null);
    }
  }

  function openUserModal(user: UserWithAccounts) {
    setSelectedUser(user);
    setShowModal(true);
  }

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    if (filter === 'awaiting') return user.accounts.some((acc) => acc.status === 'pending');
    if (filter === 'active') return user.accounts.some((acc) => acc.status === 'connected');
    return true;
  });

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'awaiting', 'active'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 sm:px-4 text-sm sm:text-base rounded-lg font-medium transition-all duration-200 ${
                filter === f
                  ? f === 'awaiting'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50'
                    : 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg shadow-blue-500/50 dark:shadow-blue-600/50'
                  : 'bg-gray-200 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700/50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Search + per-page */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-100 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-500 w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Show:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-gray-100 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-blue-600 focus:border-transparent transition-all"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-100 dark:bg-gray-800/30 rounded-xl shadow-xl border border-gray-300 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-200 dark:bg-gray-800/50 border-b border-gray-300 dark:border-b-gray-700/50">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">User</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Email</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Accounts</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Token Debt</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">KYC</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-y-gray-700/50">
              {filteredUsers.map((user) => {
                const awaitingCount = user.accounts.filter((acc) => acc.status === 'pending').length;
                const activeCount = user.accounts.filter((acc) => acc.status === 'connected').length;

                return (
                  <tr key={user.id} className="hover:bg-gray-200 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                        {user.full_name || 'No Name'}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {user.accounts.length}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                        {awaitingCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-500/30 whitespace-nowrap">
                            <Clock className="h-3 w-3 mr-1" />
                            {awaitingCount}
                          </span>
                        )}
                        {activeCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-500/30 whitespace-nowrap">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {activeCount}
                          </span>
                        )}
                        {user.accounts.length === 0 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {formatAUD(user.token_debt)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <button
                        onClick={() => handleKycToggle(user.id, user.kyc_verified)}
                        disabled={togglingKycId === user.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                          user.kyc_verified
                            ? 'bg-gradient-to-r from-blue-600 to-green-600'
                            : 'bg-gray-300 dark:bg-gray-600'
                        } ${togglingKycId === user.id ? 'opacity-50' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            user.kyc_verified ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openUserModal(user)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1 transition-colors group"
                        >
                          <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          <span className="text-xs sm:text-sm font-medium hidden sm:inline">View</span>
                        </button>
                        <button
                          onClick={() => handleForceSync(user.id)}
                          disabled={syncingUserId === user.id}
                          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center space-x-1 transition-colors group disabled:opacity-50"
                          title="Force Sync"
                        >
                          {syncingUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          )}
                          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Sync</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No users found matching your search.' : 'No users found.'}
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalUsers}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* User Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-300 dark:border-gray-700/50 rounded-xl max-w-2xl w-full p-4 sm:p-6 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              {selectedUser.full_name || selectedUser.email}
            </h2>

            <div className="mb-6 bg-gray-200/50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-300 dark:border-gray-700/30">
              <p className="text-sm text-gray-700 dark:text-gray-300">Email: {selectedUser.email}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Joined: {new Date(selectedUser.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Token Debt: {formatAUD(selectedUser.token_debt)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">KYC Verified:</span>
                <button
                  onClick={() => handleKycToggle(selectedUser.id, selectedUser.kyc_verified)}
                  disabled={togglingKycId === selectedUser.id}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                    selectedUser.kyc_verified
                      ? 'bg-gradient-to-r from-blue-600 to-green-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  } ${togglingKycId === selectedUser.id ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      selectedUser.kyc_verified ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">
              Connected Bookmaker Accounts
            </h3>

            {selectedUser.accounts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-sm">No accounts connected yet.</p>
            ) : (
              <div className="space-y-4">
                {selectedUser.accounts.map((account) => (
                  <div
                    key={account.id}
                    className="bg-gray-200/50 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-700/50 rounded-lg p-4 hover:bg-gray-300/50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                          {account.bookmaker_name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Username: {account.username}
                        </p>
                        {account.email && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Email: {account.email}
                          </p>
                        )}
                        {account.password && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Password: {account.password}
                          </p>
                        )}
                        {account.deposit_amount && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Deposit: ${account.deposit_amount}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={account.status} />
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Deposit Confirmed: {account.deposit_confirmed ? 'Yes' : 'No'}
                      </p>
                      {account.screenshot_url && (
                        <a
                          href={account.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          View Screenshot
                        </a>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => updateAccountStatus(account.id, 'connected')}
                        disabled={account.status === 'connected'}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xs sm:text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20 dark:shadow-green-600/20"
                      >
                        Mark Connected
                      </button>
                      <button
                        onClick={() => updateAccountStatus(account.id, 'pending')}
                        disabled={account.status === 'pending'}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-xs sm:text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/20"
                      >
                        Mark Pending
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors border border-gray-400/50 dark:border-gray-600/50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab 2 — Billing
// ---------------------------------------------------------------------------

function BillingTab() {
  const [cycles, setCycles] = useState<BillingCycle[]>([]);
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'failed' | 'paid'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const itemsPerPage = 10;

  const loadBilling = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('weekly_billing_cycles')
        .select('*', { count: 'exact' });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order('week_start', { ascending: false })
        .range(from, to);

      if (error) {
        setLoading(false);
        return;
      }

      setTotalItems(count || 0);
      setCycles(data || []);

      // Fetch user emails
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((c) => c.user_id))];
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, email')
          .in('id', userIds);

        const map: Record<string, string> = {};
        profiles?.forEach((p) => {
          map[p.id] = p.email || '';
        });
        setEmailMap(map);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage]);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  async function markAsPaid(cycleId: string, userId: string) {
    setActionLoading(cycleId);
    try {
      const { error: cycleError } = await supabase
        .from('weekly_billing_cycles')
        .update({ status: 'paid' as const, paid_at: new Date().toISOString() })
        .eq('id', cycleId);
      if (cycleError) throw cycleError;

      const { error: debtError } = await supabase
        .from('user_profiles')
        .update({ token_debt: 0 })
        .eq('id', userId);
      if (debtError) throw debtError;

      await loadBilling();
    } catch {
    } finally {
      setActionLoading(null);
    }
  }

  async function waiveCycle(cycleId: string, userId: string) {
    setActionLoading(cycleId);
    try {
      const { error: cycleError } = await supabase
        .from('weekly_billing_cycles')
        .update({ status: 'waived' as const })
        .eq('id', cycleId);
      if (cycleError) throw cycleError;

      const { error: debtError } = await supabase
        .from('user_profiles')
        .update({ token_debt: 0 })
        .eq('id', userId);
      if (debtError) throw debtError;

      await loadBilling();
    } catch {
    } finally {
      setActionLoading(null);
    }
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'pending', 'failed', 'paid'] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 sm:px-4 text-sm sm:text-base rounded-lg font-medium transition-all duration-200 ${
              filter === f
                ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg shadow-blue-500/50 dark:shadow-blue-600/50'
                : 'bg-gray-200 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700/50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-100 dark:bg-gray-800/30 rounded-xl shadow-xl border border-gray-300 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-200 dark:bg-gray-800/50 border-b border-gray-300 dark:border-b-gray-700/50">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">User Email</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Week</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Gross Profit</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Tokens</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Amount AUD</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Date Paid</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-y-gray-700/50">
              {cycles.map((cycle) => (
                <tr key={cycle.id} className="hover:bg-gray-200 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {emailMap[cycle.user_id] || cycle.user_id}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatWeekRange(cycle.week_start, cycle.week_end)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {formatAUD(cycle.gross_profit)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {cycle.token_debt ?? '-'}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {formatAUD(cycle.amount_aud)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <StatusBadge status={cycle.status} />
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(cycle.paid_at)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    {cycle.status !== 'paid' && cycle.status !== 'waived' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => markAsPaid(cycle.id, cycle.user_id)}
                          disabled={actionLoading === cycle.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20"
                        >
                          {actionLoading === cycle.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Mark Paid
                        </button>
                        <button
                          onClick={() => waiveCycle(cycle.id, cycle.user_id)}
                          disabled={actionLoading === cycle.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-gray-400/50 dark:border-gray-600/50"
                        >
                          {actionLoading === cycle.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          Waive
                        </button>
                      </div>
                    )}
                    {(cycle.status === 'paid' || cycle.status === 'waived') && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cycles.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            No billing cycles found.
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab 3 — API Config
// ---------------------------------------------------------------------------

function ApiConfigTab() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['betting_api_url', 'betting_api_key']);

      if (error) throw error;

      data?.forEach((row) => {
        if (row.key === 'betting_api_url') setApiUrl(row.value || '');
        if (row.key === 'betting_api_key') setApiKey(row.value || '');
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }

  function validateUrl(url: string): string | null {
    if (!url.trim()) return 'API Base URL is required.';
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) return 'URL must start with http:// or https://';
    } catch {
      return 'Please enter a valid URL (e.g. https://api.example.com).';
    }
    return null;
  }

  function validateApiKey(key: string): string | null {
    if (!key.trim()) return 'API Key is required.';
    if (key.trim().length < 8) return 'API Key seems too short (minimum 8 characters).';
    return null;
  }

  async function saveSettings() {
    setSaving(true);
    setMessage(null);

    const urlErr = validateUrl(apiUrl);
    if (urlErr) {
      setMessage({ type: 'error', text: urlErr });
      setSaving(false);
      return;
    }
    const keyErr = validateApiKey(apiKey);
    if (keyErr) {
      setMessage({ type: 'error', text: keyErr });
      setSaving(false);
      return;
    }

    try {
      const { error: urlError } = await supabase
        .from('admin_settings')
        .upsert({ key: 'betting_api_url', value: apiUrl.trim() }, { onConflict: 'key' });
      if (urlError) throw urlError;

      const { error: keyError } = await supabase
        .from('admin_settings')
        .upsert({ key: 'betting_api_key', value: apiKey.trim() }, { onConflict: 'key' });
      if (keyError) throw keyError;

      setMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setMessage(null);

    const urlErr = validateUrl(apiUrl);
    if (urlErr) {
      setMessage({ type: 'error', text: `Save a valid API URL before testing. ${urlErr}` });
      setTesting(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('sync-user-balances', {
        body: { test: true },
      });
      if (error) throw error;
      setMessage({ type: 'success', text: `Connection test successful. ${data?.message || ''}` });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Connection test failed: ${msg}` });
    } finally {
      setTesting(false);
    }
  }

  async function syncAllUsers() {
    setSyncing(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.functions.invoke('sync-user-balances');
      if (error) throw error;
      setMessage({ type: 'success', text: `Sync complete. ${data?.message || ''}` });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: `Sync failed: ${msg}` });
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-gray-100 dark:bg-gray-800/30 rounded-xl shadow-xl border border-gray-300 dark:border-gray-700/50 p-6 space-y-6">
        {/* API Base URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Base URL
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://api.example.com"
            className="bg-gray-100 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-500 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API key..."
            autoComplete="off"
            className="bg-gray-100 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-500 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-blue-600 focus:border-transparent transition-all"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Minimum 8 characters. Stored securely in the database.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 dark:shadow-blue-600/20"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save
          </button>
          <button
            onClick={testConnection}
            disabled={testing}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
            Test Connection
          </button>
          <button
            onClick={syncAllUsers}
            disabled={syncing}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20 dark:shadow-green-600/20"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync All Users Now
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30'
                : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/30'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 4 — Balances
// ---------------------------------------------------------------------------

type SortField = 'email' | 'bookmaker_name' | 'balance' | 'net_profit_week' | 'net_profit_alltime' | 'last_synced' | 'status';
type SortDir = 'asc' | 'desc';

function BalancesTab() {
  const [connections, setConnections] = useState<BookmakerConnection[]>([]);
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('email');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    loadBalances();
  }, []);

  async function loadBalances() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmaker_connections')
        .select('*');

      if (error) throw error;

      setConnections(data || []);

      // Fetch user emails
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((c) => c.user_id))];
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, email')
          .in('id', userIds);

        const map: Record<string, string> = {};
        profiles?.forEach((p) => {
          map[p.id] = p.email || '';
        });
        setEmailMap(map);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const filtered = connections.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const email = (emailMap[c.user_id] || '').toLowerCase();
    const bookmaker = (c.bookmaker_name || '').toLowerCase();
    return email.includes(q) || bookmaker.includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'email': {
        const ea = emailMap[a.user_id] || '';
        const eb = emailMap[b.user_id] || '';
        return ea.localeCompare(eb) * dir;
      }
      case 'bookmaker_name':
        return (a.bookmaker_name || '').localeCompare(b.bookmaker_name || '') * dir;
      case 'balance':
        return ((a.balance ?? 0) - (b.balance ?? 0)) * dir;
      case 'net_profit_week':
        return ((a.net_profit_week ?? 0) - (b.net_profit_week ?? 0)) * dir;
      case 'net_profit_alltime':
        return ((a.net_profit_alltime ?? 0) - (b.net_profit_alltime ?? 0)) * dir;
      case 'last_synced': {
        const da = a.last_synced_at ? new Date(a.last_synced_at).getTime() : 0;
        const db = b.last_synced_at ? new Date(b.last_synced_at).getTime() : 0;
        return (da - db) * dir;
      }
      case 'status':
        return (a.status || '').localeCompare(b.status || '') * dir;
      default:
        return 0;
    }
  });

  function SortHeader({ field, label }: { field: SortField; label: string }) {
    return (
      <th
        onClick={() => handleSort(field)}
        className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 select-none"
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'opacity-100' : 'opacity-40'}`} />
        </span>
      </th>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by email or bookmaker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-100 dark:bg-gray-800/30 text-gray-900 dark:text-gray-100 placeholder-gray-600 dark:placeholder-gray-500 w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-100 dark:bg-gray-800/30 rounded-xl shadow-xl border border-gray-300 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-200 dark:bg-gray-800/50 border-b border-gray-300 dark:border-b-gray-700/50">
              <tr>
                <SortHeader field="email" label="User Email" />
                <SortHeader field="bookmaker_name" label="Bookmaker" />
                <SortHeader field="balance" label="Balance" />
                <SortHeader field="net_profit_week" label="Net Profit (Week)" />
                <SortHeader field="net_profit_alltime" label="Net Profit (All-time)" />
                <SortHeader field="last_synced" label="Last Synced" />
                <SortHeader field="status" label="Status" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-y-gray-700/50">
              {sorted.map((conn) => (
                <tr key={conn.id} className="hover:bg-gray-200 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {emailMap[conn.user_id] || conn.user_id}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-medium capitalize">
                    {conn.bookmaker_name}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {formatAUD(conn.balance)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {formatAUD(conn.net_profit_week)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {formatAUD(conn.net_profit_alltime)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(conn.last_synced_at)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <StatusBadge status={conn.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No connections matching your search.' : 'No bookmaker connections found.'}
          </div>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Admin component
// ---------------------------------------------------------------------------

const TABS: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'billing', label: 'Billing', icon: Receipt },
  { key: 'apiconfig', label: 'API Config', icon: Settings },
  { key: 'balances', label: 'Balances', icon: Wallet },
];

export function Admin() {
  const [activeTab, setActiveTab] = useState<TabKey>('users');

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-300 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-6">
          Admin Panel
        </h1>

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-300 dark:border-gray-700/50 pb-4">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                activeTab === key
                  ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg shadow-blue-500/50 dark:shadow-blue-600/50'
                  : 'bg-gray-200 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'billing' && <BillingTab />}
        {activeTab === 'apiconfig' && <ApiConfigTab />}
        {activeTab === 'balances' && <BalancesTab />}
      </div>
    </div>
  );
}
