import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Milestone {
  key: string;
  label: string;
  emoji: string;
  check: (stats: MilestoneStats) => boolean;
}

interface MilestoneStats {
  totalProfit: number;
  hasWonBet: boolean;
}

interface MilestoneToast {
  key: string;
  label: string;
  emoji: string;
  timestamp: number;
}

const MILESTONES: Milestone[] = [
  {
    key: 'first_win',
    label: 'First Win!',
    emoji: '\uD83C\uDFAF',
    check: (stats) => stats.hasWonBet,
  },
  {
    key: 'profit_100',
    label: '$100 Club',
    emoji: '\uD83D\uDCB0',
    check: (stats) => stats.totalProfit >= 100,
  },
  {
    key: 'profit_500',
    label: '$500 Milestone',
    emoji: '\uD83D\uDD25',
    check: (stats) => stats.totalProfit >= 500,
  },
  {
    key: 'profit_1000',
    label: '$1,000 Legend',
    emoji: '\uD83C\uDFC6',
    check: (stats) => stats.totalProfit >= 1000,
  },
];

const AUTO_DISMISS_MS = 6000;

/**
 * Checks the user's cumulative profit on mount and shows
 * animated toast notifications for newly achieved milestones.
 * Previously shown milestones are tracked in localStorage.
 */
export function MilestoneBadge() {
  const { user } = useAuth();
  const [toasts, setToasts] = useState<MilestoneToast[]>([]);

  useEffect(() => {
    if (!user) return;

    async function checkMilestones() {
      try {
        // Fetch cumulative profit from betting_performance
        const { data: perfData, error: perfError } = await supabase
          .from('betting_performance')
          .select('total_profit, won_bets')
          .eq('user_id', user!.id);

        if (perfError) {
          return;
        }

        const totalProfit = perfData?.reduce((sum, row) => sum + (row.total_profit ?? 0), 0) ?? 0;
        const hasWonBet = perfData?.some((row) => (row.won_bets ?? 0) > 0) ?? false;

        const stats: MilestoneStats = { totalProfit, hasWonBet };

        // Load previously shown milestones from localStorage
        const storageKey = `eva_milestones_${user!.id}`;
        const shownRaw = localStorage.getItem(storageKey);
        const shownSet: Set<string> = new Set(shownRaw ? JSON.parse(shownRaw) : []);

        // Find new milestones
        const newMilestones: MilestoneToast[] = [];
        const updatedShown = new Set(shownSet);

        for (const milestone of MILESTONES) {
          if (!shownSet.has(milestone.key) && milestone.check(stats)) {
            newMilestones.push({
              key: milestone.key,
              label: milestone.label,
              emoji: milestone.emoji,
              timestamp: Date.now(),
            });
            updatedShown.add(milestone.key);
          }
        }

        // Persist updated milestones
        if (newMilestones.length > 0) {
          localStorage.setItem(storageKey, JSON.stringify(Array.from(updatedShown)));
          setToasts(newMilestones);
        }
      } catch (err) {
      }
    }

    checkMilestones();
  }, [user]);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) => {
      const remaining = AUTO_DISMISS_MS - (Date.now() - toast.timestamp);
      if (remaining <= 0) {
        setToasts((prev) => prev.filter((t) => t.key !== toast.key));
        return null;
      }
      return setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.key !== toast.key));
      }, remaining);
    });

    return () => {
      timers.forEach((timer) => {
        if (timer !== null) clearTimeout(timer);
      });
    };
  }, [toasts]);

  const dismissToast = (key: string) => {
    setToasts((prev) => prev.filter((t) => t.key !== key));
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <>
      <style>{`
        @keyframes milestoneSlideIn {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .milestone-toast-enter {
          animation: milestoneSlideIn 0.4s ease-out forwards;
        }
      `}</style>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.key}
            className="milestone-toast-enter pointer-events-auto min-w-[280px] bg-white dark:bg-gray-800
              border border-amber-400 dark:border-amber-500
              rounded-xl shadow-2xl p-4 flex items-center gap-3"
            role="alert"
          >
            {/* Gold accent bar */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-lg shadow-md">
              {toast.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Milestone Achieved
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {toast.label} {toast.emoji}
              </p>
            </div>
            <button
              onClick={() => dismissToast(toast.key)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </>,
    document.body
  );
}
