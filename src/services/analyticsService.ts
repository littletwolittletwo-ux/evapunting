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
  try {
    const response = await fetch(`/api/analytics/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics data:', error);

    return getMockAnalyticsData(userId);
  }
}

function getMockAnalyticsData(userId: string): AnalyticsData {
  const today = new Date();
  const history: ProfitHistoryPoint[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().split('T')[0],
      profit: Math.floor(Math.random() * 100) - 20,
    });
  }

  return {
    userId,
    bookies: {
      sportsbet: { balance: 780, profit: 130, betsPlaced: 45 },
      pointsbet: { balance: 620, profit: 70, betsPlaced: 32 },
      tab: { balance: 450, profit: -20, betsPlaced: 28 },
      neds: { balance: 890, profit: 180, betsPlaced: 52 },
      ladbrokes: { balance: 540, profit: 50, betsPlaced: 38 },
    },
    totalProfit: 450,
    userShare: 315,
    evaFee: 135,
    totalBetsPlaced: 195,
    history,
  };
}
