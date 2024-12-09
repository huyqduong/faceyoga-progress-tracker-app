-- Add last_lesson_completed_at column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_lesson_completed_at timestamp with time zone;

-- Update last_lesson_completed_at based on existing lesson_history
WITH last_completion AS (
  SELECT 
    user_id,
    MAX(completed_at) as last_completed
  FROM public.lesson_history
  GROUP BY user_id
)
UPDATE public.profiles p
SET last_lesson_completed_at = lc.last_completed
FROM last_completion lc
WHERE p.user_id = lc.user_id;

-- Add streak column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS streak integer DEFAULT 0 NOT NULL;
