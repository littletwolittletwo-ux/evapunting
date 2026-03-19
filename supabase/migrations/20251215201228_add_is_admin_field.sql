/*
  # Add is_admin field to user_profiles

  ## Changes
  1. Add new column to user_profiles table:
     - `is_admin` (boolean, default false) - Identifies admin users

  ## Security
  - Only admins can view other users' profiles (handled in application layer)
  - This field determines access to the admin panel

  ## Notes
  - Existing users will have is_admin = false by default
  - To make a user admin, manually update this field in the database
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;
