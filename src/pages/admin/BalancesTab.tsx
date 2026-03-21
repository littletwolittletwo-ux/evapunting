import { useEffect, useState } from 'react';
import { Search, ArrowUpDown, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BookmakerConnection } from './types';
import { formatAUD, formatDate } from './helpers';
import { StatusBadge } from './SharedComponents';

type SortField = 'email' | 'bookmaker_name' | 'balance' | 'net_profit_week' | 'net_profit_alltime' | 'last_synced' | 'status';
type SortDir = 'asc' | 'desc';

export function BalancesTab() {
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
