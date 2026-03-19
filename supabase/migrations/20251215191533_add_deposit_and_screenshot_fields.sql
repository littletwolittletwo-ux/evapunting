/*
  # Add Deposit Amount and Screenshot Fields

  ## Changes
  1. Add new columns to bookmaker_connections table:
     - `deposit_amount` (numeric) - The actual amount deposited by user
     - `screenshot_url` (text) - URL or reference to proof of balance screenshot
     - `deposit_confirmed` (boolean) - Whether user confirmed the deposit

  ## Notes
  - These fields help track user deposits and provide proof of balance
  - Screenshot upload is optional for verification purposes
  - Deposit confirmation is required before connection
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookmaker_connections' AND column_name = 'deposit_amount'
  ) THEN
    ALTER TABLE bookmaker_connections ADD COLUMN deposit_amount numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookmaker_connections' AND column_name = 'screenshot_url'
  ) THEN
    ALTER TABLE bookmaker_connections ADD COLUMN screenshot_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookmaker_connections' AND column_name = 'deposit_confirmed'
  ) THEN
    ALTER TABLE bookmaker_connections ADD COLUMN deposit_confirmed boolean DEFAULT false;
  END IF;
END $$;
