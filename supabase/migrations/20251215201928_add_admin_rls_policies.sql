/*
  # Add Admin Access Policies

  ## Changes
  1. Add RLS policies that allow admin users to:
     - View all user profiles
     - View all bookmaker connections
     - Update bookmaker connection statuses

  ## Security
  - Only users with is_admin = true can access other users' data
  - Regular users can still only access their own data (existing policies remain)
  - Admins cannot modify user profiles, only view them
  - Admins can update bookmaker connection statuses for verification purposes

  ## Notes
  - These policies work alongside existing user policies
  - Admin access is determined by the is_admin field in user_profiles
*/

DO $$
BEGIN
  -- Drop existing admin policies if they exist (idempotent)
  DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
  DROP POLICY IF EXISTS "Admins can view all bookmaker connections" ON bookmaker_connections;
  DROP POLICY IF EXISTS "Admins can update all bookmaker connections" ON bookmaker_connections;
END $$;

-- Allow admins to view all user profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.is_admin = true
    )
  );

-- Allow admins to view all bookmaker connections
CREATE POLICY "Admins can view all bookmaker connections"
  ON bookmaker_connections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.is_admin = true
    )
  );

-- Allow admins to update all bookmaker connections (for status changes)
CREATE POLICY "Admins can update all bookmaker connections"
  ON bookmaker_connections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.is_admin = true
    )
  );
