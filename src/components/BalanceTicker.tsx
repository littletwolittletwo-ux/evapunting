import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BOOKMAKERS } from '../types';

interface BookmakerBalance {
  bookmaker_name: string;
  label: string;
  balance: number;
  profit: number;
}

const formatAUD = (value: number): string =>
  value.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

/**
 * Pinned balance ticker bar showing connected bookmaker balances
 * with an infinite CSS marquee scroll animation.
 */
export function BalanceTicker() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<BookmakerBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchBalances() {
      try {
        const { data, error } = await supabase
          .from('bookmaker_connections')
          .select('bookmaker_name, balance, net_profit_alltime')
          .eq('user_id', user!.id)
          .eq('status', 'connected');

        if (error) {
          return;
        }

        if (data && data.length > 0) {
          const mapped: BookmakerBalance[] = data.map((conn) => {
            const bookie = BOOKMAKERS.find((b) => b.name === conn.bookmaker_name);
            return {
              bookmaker_name: conn.bookmaker_name,
              label: bookie?.label ?? conn.bookmaker_name,
              balance: conn.balance ?? 0,
              profit: conn.net_profit_alltime ?? 0,
            };
          });
          setBalances(mapped);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }

    fetchBalances();
  }, [user]);

  // Don't render if no connected bookmakers or still loading with no data
  if (loading || balances.length === 0) return null;

  // Build the ticker content string
  const tickerItems = balances.map((b) => ({
    label: b.label,
    balance: formatAUD(b.balance),
    profit: b.profit,
    profitStr: `${b.profit >= 0 ? '+' : ''}${formatAUD(b.profit)}`,
  }));

  // Duplicate for seamless loop
  const renderItems = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full overflow-hidden bg-white border-b border-gray-200">
      <style>{`
        @keyframes balanceTickerScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .balance-ticker-track {
          animation: balanceTickerScroll 30s linear infinite;
        }
        .balance-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="balance-ticker-track flex whitespace-nowrap py-2.5 px-4">
        {renderItems.map((item, index) => (
          <span key={index} className="inline-flex items-center mx-6 text-sm">
            <span className="font-medium text-gray-500">
              {item.label}:
            </span>
            <span className="ml-1.5 text-gray-900 font-semibold">
              {item.balance}
            </span>
            <span className="ml-1.5">
              (
              <span
                className={
                  item.profit >= 0
                    ? 'text-green-600 font-medium'
                    : 'text-red-600 font-medium'
                }
              >
                {item.profitStr}
              </span>
              )
            </span>
            {index < renderItems.length - 1 && (
              <span className="ml-6 text-gray-300">|</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
