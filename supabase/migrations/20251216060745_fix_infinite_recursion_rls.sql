/*
  # Fix Infinite Recursion in RLS Policies

  ## Problem
  The admin RLS policy was causing infinite recursion by querying user_profiles 
  within a policy that applies to user_profiles.

  ## Solution
  1. Drop the problematic admin policy
  2. Create a security definer function to check admin status safely
  3. Recreate the admin policy using the safe function
  4. Add trigger to sync is_admin flag to auth.users metadata for JWT access

  ## Changes
  - Drop existing admin SELECT policy
  - Create `is_user_admin()` security definer function
  - Recreate admin policy using the safe function
  - Add function to sync admin status to JWT
  - Add trigger to keep JWT metadata in sync
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Create a security definer function that bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the admin policy using the safe function
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (is_user_admin());

-- Function to update user metadata with admin status
CREATE OR REPLACE FUNCTION sync_user_admin_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users raw_app_meta_data with is_admin flag
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('is_admin', NEW.is_admin)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync admin status on insert/update
DROP TRIGGER IF EXISTS sync_admin_metadata_trigger ON user_profiles;
CREATE TRIGGER sync_admin_metadata_trigger
  AFTER INSERT OR UPDATE OF is_admin ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_admin_metadata();

-- Sync existing admin users to metadata
UPDATE auth.users u
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('is_admin', up.is_admin)
FROM user_profiles up
WHERE u.id = up.id;