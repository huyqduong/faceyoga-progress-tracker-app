-- First, disable RLS temporarily to avoid issues during policy changes
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own and admin can view all" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile non-role fields" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users own profile" ON profiles;
DROP POLICY IF EXISTS "Enable admin update for all profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_users" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;

-- Drop existing functions
DROP FUNCTION IF EXISTS check_user_is_admin(uuid);
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS is_admin(text);
DROP FUNCTION IF EXISTS is_admin();

-- Create an admin check function with a more specific name
CREATE OR REPLACE FUNCTION check_user_is_admin(check_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.id = check_id
        AND p.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Simple read policy
CREATE POLICY "profiles_read_policy"
ON profiles FOR SELECT
TO authenticated
USING (
    auth.uid() = id OR check_user_is_admin(auth.uid())
);

-- User update policy (non-admins)
CREATE POLICY "profiles_update_users"
ON profiles FOR UPDATE
TO authenticated
USING (
    auth.uid() = id AND NOT check_user_is_admin(auth.uid())
);

-- Admin update policy
CREATE POLICY "profiles_update_admin"
ON profiles FOR UPDATE
TO authenticated
USING (
    check_user_is_admin(auth.uid())
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_user_is_admin TO authenticated;
