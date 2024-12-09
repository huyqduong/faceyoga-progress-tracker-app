-- Add total_practice_time column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_practice_time integer DEFAULT 0 NOT NULL;

-- Add exercises_done column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS exercises_done integer DEFAULT 0 NOT NULL;

-- Update total_practice_time based on existing lesson_history
WITH practice_times AS (
  SELECT 
    user_id,
    SUM(practice_time) as total_time,
    COUNT(*) as total_lessons
  FROM public.lesson_history
  GROUP BY user_id
)
UPDATE public.profiles p
SET 
  total_practice_time = COALESCE(pt.total_time, 0),
  exercises_done = COALESCE(pt.total_lessons, 0)
FROM practice_times pt
WHERE p.user_id = pt.user_id;
