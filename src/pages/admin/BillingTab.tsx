import { useEffect, useState, useCallback } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BillingCycle } from './types';
import { formatAUD, formatDate, formatWeekRange } from './helpers';
import { StatusBadge, Pagination } from './SharedComponents';

export function BillingTab() {
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
