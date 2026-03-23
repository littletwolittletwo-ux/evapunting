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
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (bookmakerConnections.length === 0) {
    return (
      <div className="p-8 bg-[#F8FAFC] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
            <AlertCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to EVA AI!</h2>
            <p className="text-gray-500 mb-6">
              You haven't connected any bookmaker accounts yet. Get started by connecting your accounts to
              begin automated betting.
            </p>
            <Link
              to="/connect-accounts"
              className="inline-block px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              Connect Your First Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* 1. Balance Ticker */}
      <BalanceTicker />

      {/* 2. EVA is working - live status bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-900">EVA is actively betting</span>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* 3. Today's Performance - Hero Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Today's Performance</p>
          <p className={`text-5xl font-bold ${displayedTotalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {displayedTotalProfit >= 0 ? '+' : ''}${animatedProfit.toLocaleString()}
          </p>
          <p className="mt-3 text-lg text-gray-500">
            This Week:{' '}
            <span className={`font-semibold ${thisWeekProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {thisWeekProfit.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })}
            </span>
          </p>
        </div>

        {/* 4. Win Streak Card */}
        {winStreak >= 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-500">
                {'\uD83D\uDD25'} {winStreak} Day Win Streak!
              </p>
              <p className="text-sm text-gray-500 mt-1">You're on fire - keep it going!</p>
            </div>
          </div>
        )}

        {/* 5. Weekly Profit Banner */}
        {thisWeekProfit > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-green-600">
              {'\uD83C\uDF89'} You made {thisWeekProfit.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })} this week! {'\uD83C\uDF89'}
            </span>
          </div>
        )}

        {/* 6. Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Bankroll */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Total Bankroll</span>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${animatedBankroll.toLocaleString()}
            </p>
          </div>

          {/* Total PnL */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Total PnL</span>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <p className={`text-3xl font-bold ${displayedTotalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${animatedProfit.toLocaleString()}
              </p>
              {displayedTotalProfit >= 0 ? (
                <span className="bg-green-50 text-green-600 text-xs font-semibold rounded-full px-2 py-0.5">
                  {'\u25B2'} Profit
                </span>
              ) : (
                <span className="bg-red-50 text-red-600 text-xs font-semibold rounded-full px-2 py-0.5">
                  {'\u25BC'} Loss
                </span>
              )}
            </div>
          </div>

          {/* Your Share (70%) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Your Share (70%)</span>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-blue-600">
                ${animatedUserShare.toLocaleString()}
              </p>
              {userShare >= 0 && (
                <span className="bg-green-50 text-green-600 text-xs font-semibold rounded-full px-2 py-0.5">
                  {'\u25B2'}
                </span>
              )}
            </div>
          </div>

          {/* EVA Fee (30%) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">EVA Fee (30%)</span>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${animatedEvaFee.toLocaleString()}
            </p>
          </div>

          {/* Bets Placed */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Bets Placed</span>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-900">
                {animatedBetsPlaced.toLocaleString()}
              </p>
              {totalBetsPlaced > 0 && (
                <span className="bg-green-50 text-green-600 text-xs font-semibold rounded-full px-2 py-0.5">
                  {'\u25B2'} Active
                </span>
              )}
            </div>
          </div>

          {/* Token Debt Card */}
          <TokenDebtCard />
        </div>

        {/* 7. Profit History Chart */}
        {analyticsData && analyticsData.history.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Profit History (Last 30 Days)</h2>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <ProfitHistoryChart data={analyticsData.history} />
          </div>
        )}

        {/* 8. PnL per Bookie */}
        {analyticsData && Object.keys(analyticsData.bookies).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">PnL per Bookie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analyticsData.bookies).map(([bookieName, data]) => {
                const bookmaker = BOOKMAKERS.find((b) => b.name === bookieName);
                const profitIsPositive = data.profit >= 0;

                return (
                  <div
                    key={bookieName}
                    className="bg-[#F8FAFC] rounded-lg p-4 border border-gray-200 hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {bookmaker?.label || bookieName}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          profitIsPositive
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {profitIsPositive ? '+' : ''}${data.profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Balance:</span>
                        <span className="text-gray-900 font-medium">
                          ${data.balance.toLocaleString()}
                        </span>
                      </div>
                      {data.betsPlaced !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Bets:</span>
                          <span className="text-gray-900 font-medium">{data.betsPlaced}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 9. Bookmaker Accounts + Activity Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bookmaker Accounts</h2>
            <div className="space-y-3">
              {BOOKMAKERS.map((bookmaker) => {
                const connection = bookmakerConnections.find((c) => c.bookmaker_name === bookmaker.name);
                return (
                  <div key={bookmaker.name} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{bookmaker.label}</span>
                      {connection ? (
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            Balance: ${Number(connection.balance).toLocaleString()}
                          </div>
                          <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                            connection.status === 'connected'
                              ? 'bg-green-50 text-green-600'
                              : connection.status === 'pending'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-red-50 text-red-600'
                          }`}>
                            {connection.status}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not connected</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Summary</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Connected Accounts</span>
                <p className="text-2xl font-bold text-gray-900">{bookmakerConnections.length}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Active Bookmakers</span>
                <p className="text-2xl font-bold text-gray-900">
                  {bookmakerConnections.filter((c) => c.status === 'connected').length}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Subscription Status</span>
                <p className="text-sm text-green-600 font-semibold">Active Trial</p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started notice */}
        {totalProfit === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="font-semibold text-amber-700 mb-2">Getting Started</h3>
            <p className="text-amber-600 text-sm">
              Your accounts are being set up. Once our team completes the manual integration, your dashboard
              will automatically update with live betting data and performance statistics.
            </p>
          </div>
        )}

        {/* Components at the bottom */}
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
                  backgroundColor: ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#8b5cf6'][i % 5],
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
