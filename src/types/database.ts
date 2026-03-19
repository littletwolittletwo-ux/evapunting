export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BookmakerName =
  | 'sportsbet' | 'pointsbet' | 'tab' | 'neds' | 'ladbrokes' | 'betr' | 'boombet'
  | 'betdeluxe' | 'betnation' | 'surge' | 'noisy' | 'pulsebet' | 'bigbet' | 'yesbet' | 'mightybet' | 'blackstream';

export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'paused';

export type BillingCycleStatus = 'pending' | 'paid' | 'failed' | 'waived';

export type TokenTransactionType = 'debt_added' | 'debt_paid' | 'manual_credit';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          is_admin: boolean | null;
          subscription_status: SubscriptionStatus;
          subscription_start_date: string;
          token_balance: number;
          token_debt: number;
          stripe_customer_id: string | null;
          stripe_payment_method_id: string | null;
          external_user_id: string | null;
          kyc_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          is_admin?: boolean | null;
          subscription_status?: SubscriptionStatus;
          subscription_start_date?: string;
          token_balance?: number;
          token_debt?: number;
          stripe_customer_id?: string | null;
          stripe_payment_method_id?: string | null;
          external_user_id?: string | null;
          kyc_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          is_admin?: boolean | null;
          subscription_status?: SubscriptionStatus;
          subscription_start_date?: string;
          token_balance?: number;
          token_debt?: number;
          stripe_customer_id?: string | null;
          stripe_payment_method_id?: string | null;
          external_user_id?: string | null;
          kyc_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookmaker_connections: {
        Row: {
          id: string;
          user_id: string;
          bookmaker_name: BookmakerName;
          email: string | null;
          username: string | null;
          password: string | null;
          status: 'pending' | 'connected' | 'error';
          balance: number;
          deposit_amount: number | null;
          screenshot_url: string | null;
          deposit_confirmed: boolean | null;
          connected_at: string | null;
          last_synced_at: string | null;
          net_profit_alltime: number;
          net_profit_week: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bookmaker_name: BookmakerName;
          email?: string | null;
          username?: string | null;
          password?: string | null;
          status?: 'pending' | 'connected' | 'error';
          balance?: number;
          deposit_amount?: number | null;
          screenshot_url?: string | null;
          deposit_confirmed?: boolean | null;
          connected_at?: string | null;
          last_synced_at?: string | null;
          net_profit_alltime?: number;
          net_profit_week?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bookmaker_name?: BookmakerName;
          email?: string | null;
          username?: string | null;
          password?: string | null;
          status?: 'pending' | 'connected' | 'error';
          balance?: number;
          deposit_amount?: number | null;
          screenshot_url?: string | null;
          deposit_confirmed?: boolean | null;
          connected_at?: string | null;
          last_synced_at?: string | null;
          net_profit_alltime?: number;
          net_profit_week?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      betting_performance: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          total_bets: number;
          won_bets: number;
          total_wagered: number;
          total_profit: number;
          roi_percentage: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          total_bets?: number;
          won_bets?: number;
          total_wagered?: number;
          total_profit?: number;
          roi_percentage?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          month?: string;
          total_bets?: number;
          won_bets?: number;
          total_wagered?: number;
          total_profit?: number;
          roi_percentage?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      bets: {
        Row: {
          id: string;
          user_id: string;
          bookmaker_connection_id: string;
          sport: string;
          event_name: string;
          bet_type: string;
          odds: number;
          stake: number;
          potential_return: number;
          status: 'pending' | 'won' | 'lost' | 'void';
          placed_at: string;
          settled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bookmaker_connection_id: string;
          sport: string;
          event_name: string;
          bet_type: string;
          odds: number;
          stake: number;
          potential_return: number;
          status?: 'pending' | 'won' | 'lost' | 'void';
          placed_at?: string;
          settled_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bookmaker_connection_id?: string;
          sport?: string;
          event_name?: string;
          bet_type?: string;
          odds?: number;
          stake?: number;
          potential_return?: number;
          status?: 'pending' | 'won' | 'lost' | 'void';
          placed_at?: string;
          settled_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      weekly_billing_cycles: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          week_end: string;
          gross_profit?: number;
          token_debt?: number;
          amount_aud?: number;
          stripe_payment_intent_id?: string | null;
          paid_at?: string | null;
          status?: BillingCycleStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start?: string;
          week_end?: string;
          gross_profit?: number;
          token_debt?: number;
          amount_aud?: number;
          stripe_payment_intent_id?: string | null;
          paid_at?: string | null;
          status?: BillingCycleStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      token_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: TokenTransactionType;
          tokens: number;
          description: string | null;
          billing_cycle_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: TokenTransactionType;
          tokens: number;
          description?: string | null;
          billing_cycle_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: TokenTransactionType;
          tokens?: number;
          description?: string | null;
          billing_cycle_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_settings: {
        Row: {
          key: string;
          value: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
