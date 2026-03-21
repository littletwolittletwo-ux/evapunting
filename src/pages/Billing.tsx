import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Coins,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import type { BillingCycleStatus } from '../types/database';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface BillingCycle {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  gross_profit: number;
  token_debt: number;
  amount_aud: number;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  status: BillingCycleStatus;
  created_at: string;
}

function formatAUD(amount: number): string {
  return amount.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
}

function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  const opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('en-AU', opts)} – ${end.toLocaleDateString('en-AU', opts)}`;
}

function StatusBadge({ status }: { status: BillingCycleStatus }) {
  const config: Record<BillingCycleStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    paid: {
      bg: 'bg-green-600/10 dark:bg-green-500/20',
      text: 'text-green-600 dark:text-green-400',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    pending: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    failed: {
      bg: 'bg-red-600/10 dark:bg-red-500/20',
      text: 'text-red-600 dark:text-red-400',
      icon: <XCircle className="h-3.5 w-3.5" />,
    },
    waived: {
      bg: 'bg-gray-500/10 dark:bg-gray-500/20',
      text: 'text-gray-600 dark:text-gray-400',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
  };

  const c = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function Billing() {
  const { user, profile } = useAuth();
  const [billingCycles, setBillingCycles] = useState<BillingCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingDebt, setPayingDebt] = useState(false);
  const [debtPayResult, setDebtPayResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Payment method state
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardFormLoading, setCardFormLoading] = useState(false);
  const [cardMessage, setCardMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const cardElementRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<Stripe | null>(null);
  const cardElementInstanceRef = useRef<ReturnType<Stripe['elements']> | null>(null);

  // Collapsible sections
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [summaryExpanded, setSummaryExpanded] = useState(true);

  const loadBillingData = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('weekly_billing_cycles')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false });

      if (error) throw error;
      setBillingCycles(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  // Compute outstanding debt
  const today = new Date().toISOString().split('T')[0];
  const overdueCycles = billingCycles.filter(
    (c) => (c.status === 'failed' || c.status === 'pending') && c.week_end < today
  );
  const totalOwed = overdueCycles.reduce((sum, c) => sum + c.amount_aud, 0);

  // Compute token summary
  const lifetimeTokensCharged = billingCycles
    .filter((c) => c.status === 'paid' || c.status === 'waived')
    .reduce((sum, c) => sum + c.token_debt, 0);

  const currentWeekCycle = billingCycles.find((c) => {
    const weekEnd = new Date(c.week_end);
    const now = new Date();
    return weekEnd >= now && c.status === 'pending';
  });
  const currentWeekDebt = currentWeekCycle?.amount_aud ?? 0;

  async function handlePayDebt() {
    setPayingDebt(true);
    setDebtPayResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('pay-token-debt');

      if (error) throw error;

      setDebtPayResult({ type: 'success', message: data?.message || 'Payment processed successfully.' });
      await loadBillingData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setDebtPayResult({ type: 'error', message });
    } finally {
      setPayingDebt(false);
    }
  }

  async function handleOpenCardForm() {
    setShowCardForm(true);
    setCardFormLoading(true);
    setCardMessage(null);

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load.');
      stripeRef.current = stripe;

      const { data, error } = await supabase.functions.invoke('create-setup-intent');
      if (error) throw error;

      const secret = data?.client_secret;
      if (!secret) throw new Error('Failed to create setup intent.');
      setClientSecret(secret);

      const elements = stripe.elements({ clientSecret: secret });
      cardElementInstanceRef.current = elements;

      const cardElement = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#1f2937',
            '::placeholder': { color: '#9ca3af' },
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          },
        },
      });

      // Small delay to ensure the DOM element is mounted
      setTimeout(() => {
        if (cardElementRef.current) {
          cardElement.mount(cardElementRef.current);
        }
      }, 50);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to set up card form.';
      setCardMessage({ type: 'error', message });
    } finally {
      setCardFormLoading(false);
    }
  }

  async function handleSubmitCard() {
    if (!stripeRef.current || !clientSecret || !cardElementInstanceRef.current) return;

    setCardFormLoading(true);
    setCardMessage(null);

    try {
      const { setupIntent, error } = await stripeRef.current.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElementInstanceRef.current.getElement('card')!,
        },
      });

      if (error) {
        throw new Error(error.message || 'Card setup failed.');
      }

      if (setupIntent?.payment_method) {
        const paymentMethodId =
          typeof setupIntent.payment_method === 'string'
            ? setupIntent.payment_method
            : setupIntent.payment_method.id;

        const { error: saveError } = await supabase.functions.invoke('save-payment-method', {
          body: { payment_method_id: paymentMethodId },
        });

        if (saveError) throw saveError;

        setCardMessage({ type: 'success', message: 'Payment method saved successfully.' });
        setShowCardForm(false);
        setClientSecret(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save payment method.';
      setCardMessage({ type: 'error', message });
    } finally {
      setCardFormLoading(false);
    }
  }

  function handleCancelCardForm() {
    setShowCardForm(false);
    setClientSecret(null);
    setCardMessage(null);
    cardElementInstanceRef.current = null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const hasPaymentMethod = !!profile?.stripe_payment_method_id;
  const paymentMethodDisplay = hasPaymentMethod
    ? `Card ending in ••••${profile!.stripe_payment_method_id!.slice(-4)}`
    : null;

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-8">
          Billing &amp; Tokens
        </h1>

        {/* ── Section 1: Outstanding Debt Banner ── */}
        {overdueCycles.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 dark:bg-amber-500/20 dark:border-amber-500/40 rounded-xl p-6 mb-6 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-amber-700 dark:text-amber-300">Outstanding Balance</h2>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    You have {overdueCycles.length} overdue billing{' '}
                    {overdueCycles.length === 1 ? 'cycle' : 'cycles'} totalling{' '}
                    <span className="font-bold">{formatAUD(totalOwed)}</span>.
                  </p>
                </div>
              </div>
              <button
                onClick={handlePayDebt}
                disabled={payingDebt}
                className="relative px-6 py-3 rounded-lg font-medium text-white overflow-hidden group disabled:opacity-50 transition-all flex-shrink-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 transition-transform group-hover:scale-105"></div>
                <span className="relative">
                  {payingDebt ? 'Processing...' : `Pay ${formatAUD(totalOwed)} Now`}
                </span>
              </button>
            </div>
            {debtPayResult && (
              <div
                className={`mt-4 px-4 py-3 rounded-lg text-sm ${
                  debtPayResult.type === 'success'
                    ? 'bg-green-500/10 border border-green-600/30 text-green-600 dark:text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
                }`}
              >
                {debtPayResult.message}
              </div>
            )}
          </div>
        )}

        {/* ── Section 2: Payment Method ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Payment Method</h2>
          </div>

          {cardMessage && !showCardForm && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                cardMessage.type === 'success'
                  ? 'bg-green-500/10 border border-green-600/30 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
              }`}
            >
              {cardMessage.message}
            </div>
          )}

          {hasPaymentMethod && !showCardForm && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <CreditCard className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{paymentMethodDisplay}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Stripe Customer: {profile?.stripe_customer_id ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenCardForm}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                Update Card
              </button>
            </div>
          )}

          {!hasPaymentMethod && !showCardForm && (
            <div className="text-center py-6">
              <CreditCard className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No payment method on file.</p>
              <button
                onClick={handleOpenCardForm}
                className="relative px-6 py-3 rounded-lg font-medium text-white overflow-hidden group transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-600 transition-transform group-hover:scale-105"></div>
                <span className="relative">Add Payment Method</span>
              </button>
            </div>
          )}

          {showCardForm && (
            <div className="mt-4 space-y-4">
              <div
                ref={cardElementRef}
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 min-h-[44px]"
              />

              {cardMessage && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    cardMessage.type === 'success'
                      ? 'bg-green-500/10 border border-green-600/30 text-green-600 dark:text-green-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
                  }`}
                >
                  {cardMessage.message}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitCard}
                  disabled={cardFormLoading || !clientSecret}
                  className="relative px-6 py-3 rounded-lg font-medium text-white overflow-hidden group disabled:opacity-50 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-600 transition-transform group-hover:scale-105"></div>
                  <span className="relative">{cardFormLoading ? 'Saving...' : 'Save Card'}</span>
                </button>
                <button
                  onClick={handleCancelCardForm}
                  className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 3: Token Balance Summary ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setSummaryExpanded(!summaryExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Token Summary</h2>
            </div>
            {summaryExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {summaryExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Token Balance</span>
                  <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {(profile?.token_balance ?? 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Lifetime Tokens Charged</span>
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {lifetimeTokensCharged.toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Week Debt</span>
                  <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                </div>
                <p className={`text-2xl font-bold ${currentWeekDebt > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {formatAUD(currentWeekDebt)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 4: Billing History Table ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Billing History</h2>
            </div>
            {historyExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {historyExpanded && (
            <>
              {billingCycles.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No billing cycles yet.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Billing cycles are generated weekly based on your trading activity.
                  </p>
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Week</th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Gross Profit</th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Tokens</th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Amount AUD</th>
                        <th className="text-center py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                        <th className="text-right py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Date Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingCycles.map((cycle) => (
                        <tr
                          key={cycle.id}
                          className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="py-3 px-3 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {formatWeekRange(cycle.week_start, cycle.week_end)}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-medium whitespace-nowrap ${
                              cycle.gross_profit >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {formatAUD(cycle.gross_profit)}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-900 dark:text-gray-100">
                            {cycle.token_debt.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {formatAUD(cycle.amount_aud)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <StatusBadge status={cycle.status} />
                          </td>
                          <td className="py-3 px-3 text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {cycle.paid_at
                              ? new Date(cycle.paid_at).toLocaleDateString('en-AU', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
