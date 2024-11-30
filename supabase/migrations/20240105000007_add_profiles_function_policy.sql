-- Add policy to allow the is_admin function to access profiles
CREATE POLICY "Allow is_admin function to access profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);
