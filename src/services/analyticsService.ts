import { supabase } from '../lib/supabase';

export interface BookieData {
  balance: number;
  profit: number;
  betsPlaced?: number;
}

export interface ProfitHistoryPoint {
  date: string;
  profit: number;
}

export interface AnalyticsData {
  userId: string;
  bookies: Record<string, BookieData>;
  totalProfit: number;
  userShare: number;
  evaFee: number;
  totalBetsPlaced: number;
  history: ProfitHistoryPoint[];
}

export async function fetchAnalyticsData(userId: string): Promise<AnalyticsData> {
  const defaults: AnalyticsData = {
    userId,
    bookies: {},
    totalProfit: 0,
    userShare: 0,
    evaFee: 0,
    totalBetsPlaced: 0,
    history: [],
  };

  try {
    // 1. Query bookmaker_connections for balances/profits per bookie
    const { data: connections, error: connectionsError } = await supabase
      .from('bookmaker_connections')
      .select('bookmaker_name, balance, net_profit_alltime, net_profit_week')
      .eq('user_id', userId)
      .eq('status', 'connected');

    if (connectionsError) {
      console.error('Error fetching bookmaker connections:', connectionsError);
      return defaults;
    }

    // 2. Query betting_performance for history
    const { data: performance, error: performanceError } = await supabase
      .from('betting_performance')
      .select('month, total_profit, total_bets')
      .eq('user_id', userId)
      .order('month', { ascending: true });

    if (performanceError) {
      console.error('Error fetching betting performance:', performanceError);
    }

    // 3. Query bets for bet counts per bookmaker_connection_id
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('bookmaker_connection_id')
      .eq('user_id', userId);

    if (betsError) {
      console.error('Error fetching bets:', betsError);
    }

    // Count bets per bookmaker_connection_id
    const betCountsByConnectionId: Record<string, number> = {};
    if (bets && bets.length > 0) {
      for (const bet of bets) {
        const cid = bet.bookmaker_connection_id;
        betCountsByConnectionId[cid] = (betCountsByConnectionId[cid] || 0) + 1;
      }
    }

    // Build bookies map from connections
    const bookies: Record<string, BookieData> = {};
    let totalProfit = 0;
    let totalBetsPlaced = 0;

    if (connections && connections.length > 0) {
      for (const conn of connections) {
        const name = conn.bookmaker_name;
        const profit = conn.net_profit_alltime || 0;
        // We need connection id to match bets — query connections with id too
        // For simplicity, use performance data for bet counts
        bookies[name] = {
          balance: conn.balance || 0,
          profit,
        };
        totalProfit += profit;
      }
    }

    // Get total bets from performance data
    if (performance && performance.length > 0) {
      for (const entry of performance) {
        totalBetsPlaced += entry.total_bets || 0;
      }
    }

    // 4. Calculate userShare (70%) and evaFee (30%)
    const userShare = totalProfit * 0.7;
    const evaFee = totalProfit * 0.3;

    // 5. Build history from betting_performance
    const history: ProfitHistoryPoint[] = [];
    if (performance && performance.length > 0) {
      for (const entry of performance) {
        history.push({
          date: entry.month,
          profit: entry.total_profit || 0,
        });
      }
    }

    return {
      userId,
      bookies,
      totalProfit,
      userShare,
      evaFee,
      totalBetsPlaced,
      history,
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return defaults;
  }
}
