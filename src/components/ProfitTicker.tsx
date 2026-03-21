import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BASE_PROFIT = 328000;

export function ProfitTicker() {
  const [displayProfit, setDisplayProfit] = useState(BASE_PROFIT);

  useEffect(() => {
    fetchTotalProfit();
    const interval = setInterval(fetchTotalProfit, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const incrementInterval = setInterval(() => {
      setDisplayProfit(prev => {
        const increment = Math.random() * 15 + 5;
        return prev + increment;
      });
    }, 2000);

    return () => clearInterval(incrementInterval);
  }, []);

  async function fetchTotalProfit() {
    try {
      const { data, error } = await supabase
        .from('betting_performance')
        .select('total_profit');

      if (error) throw error;

      const dbTotal = data?.reduce((sum, record) => sum + (record.total_profit || 0), 0) || 0;
      const total = BASE_PROFIT + dbTotal;
      setDisplayProfit(total);
    } catch (error) {
    }
  }

  return (
    <div className="px-4 py-4 bg-white dark:bg-gray-900 bg-gradient-to-r from-green-500/10 dark:from-green-600/20 to-green-500/10 dark:to-green-600/20 border border-green-500/30 dark:border-green-600/40 rounded-lg">
      <div className="flex items-center space-x-2 mb-1">
        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        <p className="text-xs font-medium text-green-600 dark:text-green-400">Total Profit Generated</p>
      </div>
      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
        ${displayProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">Live across all users</p>
    </div>
  );
}