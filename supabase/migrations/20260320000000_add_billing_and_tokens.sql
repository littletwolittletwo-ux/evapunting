-- Step 1: Extend user_profiles with token/billing/stripe fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS token_balance integer DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS token_debt integer DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_payment_method_id text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS external_user_id text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS kyc_verified boolean DEFAULT false;

-- Update subscription_status check constraint to include 'paused'
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_subscription_status_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_status_check
  CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'paused'));

-- Extend bookmaker_connections with profit tracking
ALTER TABLE bookmaker_connections ADD COLUMN IF NOT EXISTS net_profit_alltime numeric DEFAULT 0;
ALTER TABLE bookmaker_connections ADD COLUMN IF NOT EXISTS net_profit_week numeric DEFAULT 0;

-- Expand bookmaker_name check to include all bookmakers
ALTER TABLE bookmaker_connections DROP CONSTRAINT IF EXISTS bookmaker_connections_bookmaker_name_check;
ALTER TABLE bookmaker_connections ADD CONSTRAINT bookmaker_connections_bookmaker_name_check
  CHECK (bookmaker_name IN (
    'sportsbet', 'pointsbet', 'tab', 'neds', 'ladbrokes', 'betr', 'boombet',
    'betdeluxe', 'betnation', 'surge', 'noisy', 'pulsebet', 'bigbet', 'yesbet', 'mightybet', 'blackstream'
  ));

-- Weekly billing cycles
CREATE TABLE IF NOT EXISTS weekly_billing_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  week_end date NOT NULL,
  gross_profit numeric DEFAULT 0,
  token_debt integer DEFAULT 0,
  amount_aud numeric DEFAULT 0,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'waived')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weekly_billing_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own cycles"
  ON weekly_billing_cycles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin can view all billing cycles
CREATE POLICY "Admins view all cycles"
  ON weekly_billing_cycles FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- Token transactions (audit log)
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('debt_added', 'debt_paid', 'manual_credit')),
  tokens integer NOT NULL,
  description text,
  billing_cycle_id uuid REFERENCES weekly_billing_cycles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions"
  ON token_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin settings (API config stored in DB)
CREATE TABLE IF NOT EXISTS admin_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true));

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_weekly_billing_cycles_user_id ON weekly_billing_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_billing_cycles_status ON weekly_billing_cycles(status);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_billing_cycle_id ON token_transactions(billing_cycle_id);
