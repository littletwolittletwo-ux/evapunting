export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
          subscription_status: 'trial' | 'active' | 'cancelled';
          subscription_start_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          is_admin?: boolean | null;
          subscription_status?: 'trial' | 'active' | 'cancelled';
          subscription_start_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          is_admin?: boolean | null;
          subscription_status?: 'trial' | 'active' | 'cancelled';
          subscription_start_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookmaker_connections: {
        Row: {
          id: string;
          user_id: string;
          bookmaker_name: 'sportsbet' | 'pointsbet' | 'tab' | 'neds' | 'ladbrokes' | 'betr' | 'boombet';
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
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bookmaker_name: 'sportsbet' | 'pointsbet' | 'tab' | 'neds' | 'ladbrokes' | 'betr' | 'boombet';
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
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bookmaker_name?: 'sportsbet' | 'pointsbet' | 'tab' | 'neds' | 'ladbrokes' | 'betr' | 'boombet';
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
          created_at?: string;
        };
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
      };
    };
  };
}
