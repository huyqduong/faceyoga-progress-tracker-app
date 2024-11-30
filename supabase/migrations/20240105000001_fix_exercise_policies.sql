-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read exercises" ON exercises;
DROP POLICY IF EXISTS "Only admins can insert exercises" ON exercises;
DROP POLICY IF EXISTS "Only admins can update exercises" ON exercises;
DROP POLICY IF EXISTS "Only admins can delete exercises" ON exercises;

-- Enable RLS for exercises
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read exercises
CREATE POLICY "Anyone can read exercises"
ON exercises FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify exercises
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
