-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own exercise history" ON exercise_history;
DROP POLICY IF EXISTS "Users can insert their own exercise history" ON exercise_history;
DROP POLICY IF EXISTS "Users can update their own exercise history" ON exercise_history;
DROP POLICY IF EXISTS "Users can delete their own exercise history" ON exercise_history;

-- Enable RLS for exercise_history
ALTER TABLE exercise_history ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own exercise history
CREATE POLICY "Users can read their own exercise history"
ON exercise_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert their own exercise history
CREATE POLICY "Users can insert their own exercise history"
ON exercise_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own exercise history
CREATE POLICY "Users can update their own exercise history"
ON exercise_history FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own exercise history
CREATE POLICY "Users can delete their own exercise history"
ON exercise_history FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
