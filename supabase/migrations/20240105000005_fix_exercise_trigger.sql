-- Drop existing triggers
DROP TRIGGER IF EXISTS on_exercise_history_insert ON exercise_history;
DROP FUNCTION IF EXISTS update_user_exercise_stats CASCADE;

-- Create a function to update user stats that only uses profiles table
CREATE OR REPLACE FUNCTION update_user_exercise_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user stats in profiles table
  UPDATE profiles
  SET 
    exercises_done = exercises_done + 1,
    practice_time = practice_time + NEW.duration
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for exercise history
CREATE TRIGGER on_exercise_history_insert
  AFTER INSERT ON exercise_history
  FOR EACH ROW
  EXECUTE FUNCTION update_user_exercise_stats();
