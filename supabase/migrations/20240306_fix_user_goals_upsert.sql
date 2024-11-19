-- Ensure we have the proper unique constraint and indexes
ALTER TABLE user_goals
DROP CONSTRAINT IF EXISTS unique_user_goals;

-- Add unique constraint on user_id
ALTER TABLE user_goals
ADD CONSTRAINT unique_user_goals UNIQUE (user_id);

-- Create index for better upsert performance
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);

-- Update RLS policies to allow upsert operations
DROP POLICY IF EXISTS "Users can insert their own goals" ON user_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON user_goals;

CREATE POLICY "Users can upsert their own goals"
ON user_goals FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);