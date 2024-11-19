-- Create exercise_history table
CREATE TABLE IF NOT EXISTS exercise_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration INTEGER NOT NULL, -- Duration in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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

-- Create indexes
CREATE INDEX idx_exercise_history_user_id ON exercise_history(user_id);
CREATE INDEX idx_exercise_history_exercise_id ON exercise_history(exercise_id);
CREATE INDEX idx_exercise_history_completed_at ON exercise_history(completed_at DESC);