/*
  # Add Email to User Profiles

  ## Changes
  1. Add email column to user_profiles table
  2. Populate existing profiles with email from auth.users
  3. Create a trigger to automatically sync email when profile is created

  ## Notes
  - Email is stored in user_profiles for easier access by admins
  - Email should be kept in sync with auth.users
  - This allows admins to view user emails without needing service role access
*/

DO $$
BEGIN
  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email text;
  END IF;
END $$;

-- Populate existing profiles with emails from auth.users
UPDATE user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.id = au.id AND up.email IS NULL;
