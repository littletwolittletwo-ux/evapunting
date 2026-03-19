/*
  # EVA AI Database Schema

  ## Tables Created

  1. **user_profiles**
     - Extends auth.users with additional user information
     - `id` (uuid, references auth.users)
     - `full_name` (text)
     - `phone` (text)
     - `subscription_status` (text) - 'trial', 'active', 'cancelled'
     - `subscription_start_date` (timestamptz)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  2. **bookmaker_connections**
     - Stores user bookmaker account connections
     - `id` (uuid, primary key)
     - `user_id` (uuid, references auth.users)
     - `bookmaker_name` (text) - 'sportsbet', 'pointsbet', etc.
     - `username` (text, encrypted in production)
     - `status` (text) - 'pending', 'connected', 'error'
     - `balance` (numeric)
     - `connected_at` (timestamptz)
     - `last_synced_at` (timestamptz)
     - `created_at` (timestamptz)

  3. **betting_performance**
     - Monthly performance metrics per user
     - `id` (uuid, primary key)
     - `user_id` (uuid, references auth.users)
     - `month` (date)
     - `total_bets` (integer)
     - `won_bets` (integer)
     - `total_wagered` (numeric)
     - `total_profit` (numeric)
     - `roi_percentage` (numeric)
     - `created_at` (timestamptz)

  4. **bets**
     - Individual bet records
     - `id` (uuid, primary key)
     - `user_id` (uuid, references auth.users)
     - `bookmaker_connection_id` (uuid, references bookmaker_connections)
     - `sport` (text)
     - `event_name` (text)
     - `bet_type` (text)
     - `odds` (numeric)
     - `stake` (numeric)
     - `potential_return` (numeric)
     - `status` (text) - 'pending', 'won', 'lost', 'void'
     - `placed_at` (timestamptz)
     - `settled_at` (timestamptz)
     - `created_at` (timestamptz)

  ## Security

  - RLS enabled on all tables
  - Users can only access their own data
  - Policies for SELECT, INSERT, UPDATE operations
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  subscription_status text DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled')),
  subscription_start_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create bookmaker_connections table
CREATE TABLE IF NOT EXISTS bookmaker_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bookmaker_name text NOT NULL CHECK (bookmaker_name IN ('sportsbet', 'pointsbet', 'tab', 'neds', 'ladbrokes', 'betr', 'boombet')),
  username text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'error')),
  balance numeric DEFAULT 0,
  connected_at timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, bookmaker_name)
);

ALTER TABLE bookmaker_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmaker connections"
  ON bookmaker_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmaker connections"
  ON bookmaker_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmaker connections"
  ON bookmaker_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmaker connections"
  ON bookmaker_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create betting_performance table
CREATE TABLE IF NOT EXISTS betting_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month date NOT NULL,
  total_bets integer DEFAULT 0,
  won_bets integer DEFAULT 0,
  total_wagered numeric DEFAULT 0,
  total_profit numeric DEFAULT 0,
  roi_percentage numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE betting_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own betting performance"
  ON betting_performance FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own betting performance"
  ON betting_performance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bookmaker_connection_id uuid NOT NULL REFERENCES bookmaker_connections(id) ON DELETE CASCADE,
  sport text NOT NULL,
  event_name text NOT NULL,
  bet_type text NOT NULL,
  odds numeric NOT NULL,
  stake numeric NOT NULL,
  potential_return numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void')),
  placed_at timestamptz DEFAULT now(),
  settled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bets"
  ON bets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bets"
  ON bets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookmaker_connections_user_id ON bookmaker_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_betting_performance_user_id ON betting_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_betting_performance_month ON betting_performance(month);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_placed_at ON bets(placed_at);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
