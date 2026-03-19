import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const formatAUD = (value: number): string =>
  value.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

/**
 * Returns the ISO week number for a given date.
 */
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Returns the Monday of the previous week from a given date.
 */
function getLastWeekMonday(date: Date): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ...
  // Go to this week's Monday
  const thisMondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + thisMondayOffset);
  // Go back 7 days for last week's Monday
  d.setDate(d.getDate() - 7);
  return d;
}

interface WeeklySummary {
  grossProfit: number;
  tokenDebt: number;
  netProfit: number;
}

const CONFETTI_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16',
];

const CONFETTI_COUNT = 50;

/**
 * Modal shown once on Monday when the user loads the dashboard.
 * Displays last week's financial summary with optional confetti.
 */
export function WeeklyBillingSummaryModal() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const isMonday = today.getDay() === 1;

  // Build the localStorage key for this week
  const storageKey = useMemo(() => {
    const year = today.getFullYear();
    const week = getISOWeekNumber(today).toString().padStart(2, '0');
    return `eva_summary_shown_${year}-${week}`;
  }, [today]);

  useEffect(() => {
    if (!user || !isMonday) {
      setLoading(false);
      return;
    }

    // Check if already shown this week
    const alreadyShown = localStorage.getItem(storageKey);
    if (alreadyShown) {
      setLoading(false);
      return;
    }

    async function fetchLastWeekSummary() {
      try {
        const lastMonday = getLastWeekMonday(today);
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastSunday.getDate() + 6);

        const weekStartStr = lastMonday.toISOString().split('T')[0];
        const weekEndStr = lastSunday.toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('weekly_billing_cycles')
          .select('gross_profit, token_debt, amount_aud')
          .eq('user_id', user!.id)
          .gte('week_start', weekStartStr)
          .lte('week_end', weekEndStr)
          .maybeSingle();

        if (error) {
          console.error('Error fetching weekly summary:', error);
          setLoading(false);
          return;
        }

        if (data) {
          const grossProfit = data.gross_profit ?? 0;
          const tokenDebt = data.token_debt ?? 0;
          // amount_aud is the AUD equivalent of token_debt charged
          const amountAud = data.amount_aud ?? 0;
          setSummary({
            grossProfit,
            tokenDebt,
            netProfit: grossProfit - amountAud,
          });
          setVisible(true);
        }
      } catch (err) {
        console.error('Error in WeeklyBillingSummaryModal:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLastWeekSummary();
  }, [user, isMonday, storageKey, today]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setVisible(false);
  };

  if (!visible || !summary || loading) return null;

  const showConfetti = summary.netProfit > 0;

  return createPortal(
    <>
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes modalFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .weekly-modal-enter {
          animation: modalFadeIn 0.3s ease-out forwards;
        }
        .confetti-particle {
          position: fixed;
          top: -10px;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          animation: confettiFall linear forwards;
          pointer-events: none;
          z-index: 10001;
        }
      `}</style>

      {/* Confetti */}
      {showConfetti &&
        Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
          const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
          const left = Math.random() * 100;
          const delay = Math.random() * 2;
          const duration = 2 + Math.random() * 3;
          const size = 6 + Math.random() * 6;
          return (
            <div
              key={i}
              className="confetti-particle"
              style={{
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center"
        onClick={handleDismiss}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Modal */}
        <div
          className="weekly-modal-enter relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-5">
            <h2 className="text-xl font-bold text-white">
              Weekly Summary
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Here's how last week went
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-4">
            {/* Gross Profit */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Gross Profit
              </span>
              <span
                className={`text-lg font-bold ${
                  summary.grossProfit >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-500 dark:text-red-400'
                }`}
              >
                {formatAUD(summary.grossProfit)}
              </span>
            </div>

            {/* Token Debt Charged */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Token Debt Charged
              </span>
              <span className="text-lg font-bold text-amber-500 dark:text-amber-400">
                {summary.tokenDebt.toLocaleString()} tokens
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Net Profit */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Net Profit
              </span>
              <span
                className={`text-2xl font-bold ${
                  summary.netProfit >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-500 dark:text-red-400'
                }`}
              >
                {formatAUD(summary.netProfit)}
              </span>
            </div>

            {showConfetti && (
              <p className="text-center text-sm text-green-600 dark:text-green-400 font-medium">
                Great week! Keep it up!
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              onClick={handleDismiss}
              className="w-full py-3 px-4 rounded-lg text-white font-medium text-sm
                bg-gradient-to-r from-blue-600 to-green-600
                hover:from-blue-700 hover:to-green-700
                transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
