-- Drop the existing unique constraint
ALTER TABLE user_goals
DROP CONSTRAINT IF EXISTS unique_user_goals;

-- Add ON DELETE CASCADE to user_id foreign key
ALTER TABLE user_goals
DROP CONSTRAINT IF EXISTS user_goals_user_id_fkey;

ALTER TABLE user_goals
ADD CONSTRAINT user_goals_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create a new unique constraint
ALTER TABLE user_goals
ADD CONSTRAINT unique_user_goals UNIQUE (user_id);

-- Update RLS policies to handle updates properly
DROP POLICY IF EXISTS "Users can update their own goals" ON user_goals;

CREATE POLICY "Users can update their own goals"
ON user_goals FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);