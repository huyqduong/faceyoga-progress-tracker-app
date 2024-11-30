-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can insert exercises" ON exercises;
DROP POLICY IF EXISTS "Only admins can update exercises" ON exercises;
DROP POLICY IF EXISTS "Only admins can delete exercises" ON exercises;

-- Create new policies that only check profiles table
CREATE POLICY "Only admins can insert exercises"
ON exercises FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can update exercises"
ON exercises FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can delete exercises"
ON exercises FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
