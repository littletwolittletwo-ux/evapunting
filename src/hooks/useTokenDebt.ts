import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BillingCycle {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  gross_profit: number;
  token_debt: number;
  amount_aud: number;
  status: 'pending' | 'paid' | 'failed' | 'waived';
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
}

interface UseTokenDebtReturn {
  tokenDebt: number;
  tokenBalance: number;
  currentCycle: BillingCycle | null;
  daysUntilBilling: number;
  isOverdue: boolean;
  loading: boolean;
}

/**
 * Returns the number of days from `today` until the next Monday.
 * If today is Monday, returns 7 (next Monday).
 */
function getDaysUntilNextMonday(): number {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
  // Days until next Monday: (1 - dayOfWeek + 7) % 7, but if already Monday return 7
  const days = (1 - dayOfWeek + 7) % 7;
  return days === 0 ? 7 : days;
}

export function useTokenDebt(): UseTokenDebtReturn {
  const { user } = useAuth();
  const [tokenDebt, setTokenDebt] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [currentCycle, setCurrentCycle] = useState<BillingCycle | null>(null);
  const [isOverdue, setIsOverdue] = useState(false);
  const [loading, setLoading] = useState(true);

  const daysUntilBilling = getDaysUntilNextMonday();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);

        // Fetch user profile for token_debt and token_balance
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('token_debt, token_balance')
          .eq('id', user!.id)
          .maybeSingle();

        if (!profileError && profileData) {
          setTokenDebt(profileData.token_debt ?? 0);
          setTokenBalance(profileData.token_balance ?? 0);
        }

        // Fetch current week's billing cycle (week_start <= today <= week_end)
        const todayStr = new Date().toISOString().split('T')[0];

        const { data: cycleData, error: cycleError } = await supabase
          .from('weekly_billing_cycles')
          .select('*')
          .eq('user_id', user!.id)
          .lte('week_start', todayStr)
          .gte('week_end', todayStr)
          .maybeSingle();

        if (!cycleError) {
          setCurrentCycle(cycleData ?? null);
        }

        // Check for overdue cycles:
        // Any cycle with status = 'failed', or status = 'pending' and week_end < today
        const { data: overdueCycles, error: overdueError } = await supabase
          .from('weekly_billing_cycles')
          .select('id')
          .eq('user_id', user!.id)
          .or(`status.eq.failed,and(status.eq.pending,week_end.lt.${todayStr})`)
          .limit(1);

        if (!overdueError) {
          setIsOverdue((overdueCycles?.length ?? 0) > 0);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  return {
    tokenDebt,
    tokenBalance,
    currentCycle,
    daysUntilBilling,
    isOverdue,
    loading,
  };
}
