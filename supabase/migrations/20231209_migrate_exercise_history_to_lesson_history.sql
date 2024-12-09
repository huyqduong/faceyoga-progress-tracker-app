-- Drop the old exercise_history table and create lesson_history
DROP TABLE IF EXISTS public.lesson_history CASCADE;

-- Create lesson_history table
CREATE TABLE IF NOT EXISTS public.lesson_history (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    practice_time integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migrate data from exercise_history to lesson_history
INSERT INTO public.lesson_history (
    id,
    user_id,
    lesson_id,
    completed_at,
    practice_time,
    created_at
)
SELECT 
    id,
    user_id,
    exercise_id as lesson_id,
    completed_at,
    duration as practice_time,
    COALESCE(created_at, NOW())
FROM public.exercise_history;

-- Update the updated_at field to match created_at for migrated data
UPDATE public.lesson_history
SET updated_at = created_at;

-- Drop the old exercise_history table
DROP TABLE IF EXISTS public.exercise_history CASCADE;

-- Add indexes
CREATE INDEX idx_lesson_history_user_id ON public.lesson_history(user_id);
CREATE INDEX idx_lesson_history_lesson_id ON public.lesson_history(lesson_id);
CREATE INDEX idx_lesson_history_completed_at ON public.lesson_history(completed_at);

-- Add RLS policies
ALTER TABLE public.lesson_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lesson history"
    ON public.lesson_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson history"
    ON public.lesson_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson history"
    ON public.lesson_history
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lesson history"
    ON public.lesson_history
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
