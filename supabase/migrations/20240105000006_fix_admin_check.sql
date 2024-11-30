-- Create a function to check admin status without accessing users table
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can insert exercises" ON exercises;
DROP POLICY IF EXISTS "Only admins can update exercises" ON exercises;
DROP POLICY IF EXISTS "Only admins can delete exercises" ON exercises;

-- Create new policies using the function
CREATE POLICY "Only admins can insert exercises"
ON exercises FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update exercises"
ON exercises FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete exercises"
ON exercises FOR DELETE
TO authenticated
USING (is_admin());
