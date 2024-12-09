-- Add completed_lessons and last_lesson_completed columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS completed_lessons uuid[] DEFAULT '{}'::uuid[] NOT NULL,
ADD COLUMN IF NOT EXISTS last_lesson_completed timestamp with time zone;

-- Add index for better performance when querying completed lessons
CREATE INDEX IF NOT EXISTS profiles_completed_lessons_idx ON public.profiles USING GIN (completed_lessons);
CREATE INDEX IF NOT EXISTS profiles_last_lesson_completed_idx ON public.profiles(last_lesson_completed);

-- Create function to update practice time and last_lesson_completed when marking lesson as completed
CREATE OR REPLACE FUNCTION public.update_profile_on_lesson_completion()
RETURNS trigger AS $$
DECLARE
    lesson_duration text;
    duration_minutes integer;
BEGIN
    -- Get the duration of the completed lesson
    SELECT duration INTO lesson_duration FROM public.lessons WHERE id = NEW.completed_lessons[array_length(NEW.completed_lessons, 1)];
    
    -- Extract minutes from duration (assuming format like '5 minutes', '10 minutes', etc.)
    duration_minutes := (regexp_match(lesson_duration, '^(\d+)'))[1]::integer;
    
    -- Update practice time and last_lesson_completed
    NEW.practice_time := COALESCE(OLD.practice_time, 0) + duration_minutes;
    NEW.last_lesson_completed := timezone('utc'::text, now());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update practice time and last_lesson_completed
DROP TRIGGER IF EXISTS update_profile_on_lesson_completion ON public.profiles;
CREATE TRIGGER update_profile_on_lesson_completion
    BEFORE UPDATE OF completed_lessons ON public.profiles
    FOR EACH ROW
    WHEN (NEW.completed_lessons IS DISTINCT FROM OLD.completed_lessons)
    EXECUTE FUNCTION public.update_profile_on_lesson_completion();
