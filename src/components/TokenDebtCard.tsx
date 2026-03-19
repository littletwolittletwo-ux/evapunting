import { useState } from 'react';
import { Coins } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTokenDebt } from '../hooks/useTokenDebt';
import { useCountUp } from '../hooks/useCountUp';

const formatAUD = (value: number): string =>
  value.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

/**
 * Dashboard stat card displaying the user's current token debt,
 * billing cycle status, and a "Pay Now" action button.
 */
export function TokenDebtCard() {
  const { tokenDebt, currentCycle, daysUntilBilling, isOverdue, loading } = useTokenDebt();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);

  const animatedDebt = useCountUp(tokenDebt);

  // Determine the status badge
  const getStatusBadge = () => {
    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
          Overdue
        </span>
      );
    }
    if (currentCycle?.status === 'paid' || currentCycle?.status === 'waived') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
          Paid
        </span>
      );
    }
    if (tokenDebt > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
          Due
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
        Paid
      </span>
    );
  };

  const handlePayNow = async () => {
    setPaying(true);
    setPayError(null);
    setPaySuccess(false);

    try {
      const { data, error } = await supabase.functions.invoke('pay-token-debt');

      if (error) {
        setPayError(error.message ?? 'Payment failed. Please try again.');
      } else if (data?.error) {
        setPayError(data.error);
      } else {
        setPaySuccess(true);
      }
    } catch (err) {
      setPayError('An unexpected error occurred. Please try again.');
      console.error('Error paying token debt:', err);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    );
  }

  // Token-to-AUD conversion: current cycle's amount_aud represents the AUD value,
  // or fall back to a display of debt tokens only if no cycle is present
  const debtAUD = currentCycle?.amount_aud ?? 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Token Debt
          </h3>
        </div>
        {getStatusBadge()}
      </div>

      {/* Debt Amount */}
      <div className="mb-3">
        <p
          className={`text-2xl font-bold ${
            tokenDebt > 0
              ? 'text-amber-500 dark:text-amber-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {Math.round(animatedDebt).toLocaleString()} tokens
        </p>
        {debtAUD > 0 && (
          <p className="text-sm text-amber-500 dark:text-amber-400 mt-0.5">
            {formatAUD(debtAUD)}
          </p>
        )}
        {tokenDebt === 0 && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">
            {formatAUD(0)}
          </p>
        )}
      </div>

      {/* Billing Info */}
      <div className="mb-4">
        {isOverdue ? (
          <p className="text-sm font-medium text-red-500 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Payment overdue
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Next billing: {daysUntilBilling} day{daysUntilBilling !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Pay Now Button */}
      {tokenDebt > 0 && !paySuccess && (
        <button
          onClick={handlePayNow}
          disabled={paying}
          className="w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm
            bg-gradient-to-r from-amber-500 to-orange-500
            hover:from-amber-600 hover:to-orange-600
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {paying ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : (
            'Pay Now'
          )}
        </button>
      )}

      {/* Success Message */}
      {paySuccess && (
        <div className="text-sm text-green-600 dark:text-green-400 font-medium text-center py-2">
          Payment successful!
        </div>
      )}

      {/* Error Message */}
      {payError && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-2 text-center">
          {payError}
        </p>
      )}
    </div>
  );
}
