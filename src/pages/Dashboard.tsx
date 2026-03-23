import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Activity, AlertCircle, Target, BarChart3, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BOOKMAKERS } from '../types';
import { ProfitHistoryChart } from '../components/ProfitHistoryChart';
import { fetchAnalyticsData, AnalyticsData } from '../services/analyticsService';
import '../styles/theme.css'; // Add this import for global theme styles
import { useCountUp } from '../hooks/useCountUp';
import { useTokenDebt } from '../hooks/useTokenDebt';
import { BalanceTicker } from '../components/BalanceTicker';
import { WinToast } from '../components/WinToast';
import { WeeklyBillingSummaryModal } from '../components/WeeklyBillingSummaryModal';
import { TokenDebtCard } from '../components/TokenDebtCard';
import { MilestoneBadge } from '../components/MilestoneBadge';
import { Flame } from 'lucide-react';

interface BookmakerConnection {
  id: string;
  bookmaker_name: string;
  balance: number;
  status: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const [bookmakerConnections, setBookmakerConnections] = useState<BookmakerConnection[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [winStreak, setWinStreak] = useState(0);
  const [thisWeekProfit, setThisWeekProfit] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // All hooks MUST be called unconditionally before any early returns
  useTokenDebt();

  const totalBankroll = bookmakerConnections.reduce((sum, conn) => sum + Number(conn.balance), 0);
  const displayedTotalProfit = analyticsData?.totalProfit ?? totalProfit;
  const userShare = analyticsData?.userShare ?? displayedTotalProfit * 0.7;
  const evaFee = analyticsData?.evaFee ?? displayedTotalProfit * 0.3;
  const totalBetsPlaced = analyticsData?.totalBetsPlaced ?? 0;

  const animatedBankroll = useCountUp(totalBankroll);
  const animatedProfit = useCountUp(displayedTotalProfit);
  const animatedUserShare = useCountUp(userShare);
  const animatedEvaFee = useCountUp(evaFee);
  const animatedBetsPlaced = useCountUp(totalBetsPlaced);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    if (!user) return;

    try {
      const { data: connections, error: connectionsError } = await supabase
        .from('bookmaker_connections')
        .select('*')
        .eq('user_id', user.id);

      if (connectionsError) throw connectionsError;

      setBookmakerConnections(connections || []);

      const { data: performance, error: performanceError } = await supabase
        .from('betting_performance')
        .select('total_profit')
        .eq('user_id', user.id);

      if (performanceError && performanceError.code !== 'PGRST116') {
      }

      const totalProfitValue = performance?.reduce((sum, p) => sum + Number(p.total_profit), 0) || 0;
      setTotalProfit(totalProfitValue);

      const analytics = await fetchAnalyticsData(user.id);
      setAnalyticsData(analytics);

      // Win streak calculation
      const { data: recentBets } = await supabase
        .from('bets')
        .select('settled_at, status')
        .eq('user_id', user.id)
        .eq('status', 'won')
        .order('settled_at', { ascending: false })
        .limit(50);

      if (recentBets && recentBets.length > 0) {
        const winDates = new Set(
          recentBets.map(b => b.settled_at ? new Date(b.settled_at).toDateString() : null).filter(Boolean)
        );
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          if (winDates.has(d.toDateString())) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }
        setWinStreak(streak);
      }

      // This week's profit calculation
      const weekProfit = (connections || []).reduce((sum: number, c: any) => sum + Number(c.net_profit_week || 0), 0);
      setThisWeekProfit(weekProfit);

      // Confetti on positive week profit (once per day)
      if (weekProfit > 0) {
        const confettiKey = `eva_confetti_${new Date().toISOString().slice(0,10)}`;
        if (!localStorage.getItem(confettiKey)) {
          setShowConfetti(true);
          localStorage.setItem(confettiKey, 'true');
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (bookmakerConnections.length === 0) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 rounded-xl p-8 text-center backdrop-blur-xl">
            <AlertCircle className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome to EVA AI!</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              You haven't connected any bookmaker accounts yet. Get started by connecting your accounts to
              begin automated betting.
            </p>
            <Link
              to="/connect-accounts"
              className="relative inline-block px-6 py-3 rounded-lg font-semibold text-white dark:text-gray-100 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-500 dark:to-green-500 transition-transform group-hover:scale-105"></div>
              <span className="relative">Connect Your First Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent mb-8">Dashboard</h1>
        <BalanceTicker />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-blue-400 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bankroll</span>
              <DollarSign className="h-5 w-5 text-gray-700 dark:text-gray-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${animatedBankroll.toLocaleString()}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-green-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-400 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700 dark:text-gray-400">Total PnL</span>
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className={`text-3xl font-bold ${displayedTotalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ${animatedProfit.toLocaleString()}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-400 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-gray-400">Your Share (70%)</span>
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ${animatedUserShare.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">EVA Fee (30%)</span>
              <Activity className="h-5 w-5 text-gray-700 dark:text-gray-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${animatedEvaFee.toLocaleString()}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-green-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-400 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700 dark:text-gray-400">Bets Placed</span>
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {animatedBetsPlaced.toLocaleString()}
            </p>
          </div>
          <TokenDebtCard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week's Profit</span>
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className={`text-3xl font-bold ${thisWeekProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {thisWeekProfit.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })}
            </p>
          </div>
          {winStreak >= 2 && (
            <div className="bg-orange-50 dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-orange-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-700 dark:text-gray-400">Win Streak</span>
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-orange-500">
                {'\uD83D\uDD25'} {winStreak} day{winStreak !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {analyticsData && analyticsData.history.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">Profit History (Last 30 Days)</h2>
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <ProfitHistoryChart data={analyticsData.history} />
          </div>
        )}

        {analyticsData && Object.keys(analyticsData.bookies).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">PnL per Bookie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analyticsData.bookies).map(([bookieName, data]) => {
                const bookmaker = BOOKMAKERS.find((b) => b.name === bookieName);
                const profitIsPositive = data.profit >= 0;

                return (
                  <div
                    key={bookieName}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                        {bookmaker?.label || bookieName}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          profitIsPositive
                            ? 'bg-green-600/20 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                            : 'bg-red-600/20 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                        }`}
                      >
                        {profitIsPositive ? '+' : ''}${data.profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          ${data.balance.toLocaleString()}
                        </span>
                      </div>
                      {data.betsPlaced !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Bets:</span>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">{data.betsPlaced}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">Bookmaker Accounts</h2>
            <div className="space-y-3">
              {BOOKMAKERS.map((bookmaker) => {
                const connection = bookmakerConnections.find((c) => c.bookmaker_name === bookmaker.name);
                return (
                  <div key={bookmaker.name} className="border-b border-gray-200 dark:border-gray-600 pb-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{bookmaker.label}</span>
                      {connection ? (
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Balance: ${Number(connection.balance).toLocaleString()}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            connection.status === 'connected'
                              ? 'bg-green-600/10 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                              : connection.status === 'pending'
                              ? 'bg-yellow-600/10 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400'
                              : 'bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                          }`}>
                            {connection.status}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Not connected</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">Activity Summary</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Connected Accounts</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{bookmakerConnections.length}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Bookmakers</span>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {bookmakerConnections.filter((c) => c.status === 'connected').length}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscription Status</span>
                <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Active Trial</p>
              </div>
            </div>
          </div>
        </div>

        {totalProfit === 0 && (
          <div className="bg-yellow-600/10 border border-yellow-600/30 dark:bg-yellow-500/10 dark:border-yellow-500/30 rounded-xl p-6 backdrop-blur-xl">
            <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Getting Started</h3>
            <p className="text-yellow-700/80 dark:text-yellow-300/80 text-sm">
              Your accounts are being set up. Once our team completes the manual integration, your dashboard
              will automatically update with live betting data and performance statistics.
            </p>
          </div>
        )}

        <WinToast />
        <WeeklyBillingSummaryModal />
        <MilestoneBadge />
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-5%`,
                  backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
                  animation: `confettiFall ${2 + Math.random() * 3}s ease-in ${Math.random() * 2}s forwards`,
                }}
              />
            ))}
            <style>{`
              @keyframes confettiFall {
                to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}