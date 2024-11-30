-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read section_exercises" ON section_exercises;
DROP POLICY IF EXISTS "Only admins can insert section_exercises" ON section_exercises;
DROP POLICY IF EXISTS "Only admins can update section_exercises" ON section_exercises;
DROP POLICY IF EXISTS "Only admins can delete section_exercises" ON section_exercises;

-- Enable RLS for section_exercises
ALTER TABLE section_exercises ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read section_exercises
CREATE POLICY "Anyone can read section_exercises"
ON section_exercises FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM course_sections cs
    WHERE cs.id = section_exercises.section_id
  )
);

-- Only admins can modify section_exercises
CREATE POLICY "Only admins can insert section_exercises"
ON section_exercises FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can update section_exercises"
ON section_exercises FOR UPDATE
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

CREATE POLICY "Only admins can delete section_exercises"
ON section_exercises FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);
