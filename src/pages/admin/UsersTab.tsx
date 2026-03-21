import { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Search,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { UserWithAccounts } from './types';
import { formatAUD } from './helpers';
import { StatusBadge, Pagination } from './SharedComponents';

export function UsersTab() {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
