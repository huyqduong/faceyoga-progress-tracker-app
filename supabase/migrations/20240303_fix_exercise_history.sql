-- Drop existing exercise_history table and recreate with proper structure
DROP TABLE IF EXISTS exercise_history CASCADE;

CREATE TABLE exercise_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_exercise
        FOREIGN KEY (exercise_id) 
        REFERENCES exercises(id)
        ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE exercise_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own exercise history"
    ON exercise_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise history"
    ON exercise_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_exercise_history_user_id ON exercise_history(user_id);
CREATE INDEX idx_exercise_history_exercise_id ON exercise_history(exercise_id);
CREATE INDEX idx_exercise_history_completed_at ON exercise_history(completed_at DESC);

-- Create or replace the function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats_on_exercise()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET 
        exercises_done = exercises_done + 1,
        practice_time = practice_time + NEW.duration
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating user stats
DROP TRIGGER IF EXISTS update_user_stats_on_exercise_completion ON exercise_history;
CREATE TRIGGER update_user_stats_on_exercise_completion
    AFTER INSERT ON exercise_history
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_exercise();