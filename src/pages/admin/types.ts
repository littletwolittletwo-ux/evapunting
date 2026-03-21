export interface BookmakerConnection {
  id: string;
  user_id: string;
  bookmaker_name: string;
  username: string | null;
  email: string | null;
  password: string | null;
  status: string;
  deposit_amount: number | null;
  screenshot_url: string | null;
  deposit_confirmed: boolean | null;
  created_at: string;
  balance: number;
  net_profit_week: number;
  net_profit_alltime: number;
  last_synced_at: string | null;
  connected_at: string | null;
}

export interface UserWithAccounts {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  token_debt: number | null;
  kyc_verified: boolean;
  accounts: BookmakerConnection[];
}

export interface BillingCycle {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  gross_profit: number;
  token_debt: number;
  amount_aud: number;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  status: string;
  created_at: string;
}

export type TabKey = 'users' | 'billing' | 'apiconfig' | 'balances';
