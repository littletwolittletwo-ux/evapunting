export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookmakerAccount {
  id: string;
  user_id: string;
  bookmaker: string;
  username: string;
  account_id: string | null;
  deposit_confirmed: boolean;
  screenshot_url: string | null;
  status: 'awaiting_connection' | 'active';
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_bankroll: number;
  total_profit: number;
  eva_fee: number;
  user_share: number;
  bets_placed: number;
  last_updated: string;
  created_at: string;
}

export interface BookmakerStats {
  id: string;
  user_id: string;
  bookmaker: string;
  balance: number;
  profit: number;
  bets_placed: number;
  last_updated: string;
}

export interface BettingHistory {
  id: string;
  user_id: string;
  profit_date: string;
  daily_profit: number;
  created_at: string;
}

export const BOOKMAKERS = [
  { name: 'sportsbet', label: 'Sportsbet', deposit: 250 },
  { name: 'pointsbet', label: 'PointsBet', deposit: 250 },
  { name: 'tab', label: 'TAB', deposit: 200 },
  { name: 'neds', label: 'Neds', deposit: 250 },
  { name: 'ladbrokes', label: 'Ladbrokes', deposit: 250 },
  { name: 'betr', label: 'Betr', deposit: 150 },
  { name: 'boombet', label: 'Boombet', deposit: 150 },
  { name: 'betdeluxe', label: 'BetDeluxe', deposit: 200 },
  { name: 'betnation', label: 'Bet Nation', deposit: 200 },
  { name: 'surge', label: 'Surge', deposit: 200 },
  { name: 'noisy', label: 'Noisy', deposit: 200 },
  { name: 'pulsebet', label: 'PulseBet', deposit: 200 },
  { name: 'bigbet', label: 'BigBet', deposit: 200 },
  { name: 'yesbet', label: 'YesBet', deposit: 200 },
  { name: 'mightybet', label: 'MightyBet', deposit: 200 },
  { name: 'blackstream', label: 'Black Stream', deposit: 200 },
];
