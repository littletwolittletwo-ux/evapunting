import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRealtimeBets } from '../hooks/useRealtimeBets';

interface WinToastData {
  id: string;
  profit: number;
  eventName: string;
  timestamp: number;
}

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 5000;

const formatAUD = (value: number): string =>
  value.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

/**
 * Renders real-time win toast notifications at the bottom-right of the viewport.
 * Uses a React portal to render directly into document.body.
 * Stacks up to 3 toasts, auto-dismissing after 5 seconds.
 */
export function WinToast() {
  const [toasts, setToasts] = useState<WinToastData[]>([]);

  const handleWin = useCallback((bet: any) => {
    const profit = (bet.odds * bet.stake) - bet.stake;
    const toast: WinToastData = {
      id: bet.id ?? `${Date.now()}-${Math.random()}`,
      profit,
      eventName: bet.event_name ?? 'Unknown event',
      timestamp: Date.now(),
    };

    setToasts((prev) => {
      const updated = [...prev, toast];
      // Keep only the most recent MAX_TOASTS (dismiss oldest first)
      if (updated.length > MAX_TOASTS) {
        return updated.slice(updated.length - MAX_TOASTS);
      }
      return updated;
    });
  }, []);

  useRealtimeBets(handleWin);

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) => {
      const remaining = AUTO_DISMISS_MS - (Date.now() - toast.timestamp);
      if (remaining <= 0) {
        // Already expired, remove immediately
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        return null;
      }
      return setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, remaining);
    });

    return () => {
      timers.forEach((timer) => {
        if (timer !== null) clearTimeout(timer);
      });
    };
  }, [toasts]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <>
      <style>{`
        @keyframes winToastSlideIn {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .win-toast-enter {
          animation: winToastSlideIn 0.35s ease-out forwards;
        }
      `}</style>
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="win-toast-enter pointer-events-auto max-w-sm w-96 bg-green-50 border-l-4 border-green-500 rounded-xl shadow-lg p-5 flex items-start gap-4"
            role="alert"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">
              {'\uD83C\uDF89'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-green-600">
                {'\uD83C\uDF89'} Won! {formatAUD(toast.profit)}
              </p>
              <p className="text-sm text-gray-500 mt-1 truncate">
                on {toast.eventName}
              </p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
