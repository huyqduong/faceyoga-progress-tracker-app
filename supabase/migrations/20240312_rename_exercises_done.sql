-- Drop existing trigger first
DROP TRIGGER IF EXISTS update_user_stats_after_lesson ON lesson_history;
DROP FUNCTION IF EXISTS update_user_stats_on_exercise CASCADE;

-- Rename exercises_done to lessons_completed in profiles table
ALTER TABLE public.profiles 
RENAME COLUMN exercises_done TO lessons_completed;

-- Create updated trigger function
CREATE OR REPLACE FUNCTION update_user_stats_on_exercise()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET 
        lessons_completed = lessons_completed + 1,
        total_practice_time = total_practice_time + NEW.practice_time
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER update_user_stats_after_lesson
    AFTER INSERT ON lesson_history
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_exercise();
