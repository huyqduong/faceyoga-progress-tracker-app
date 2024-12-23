-- Add is_premium column to lessons table
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false NOT NULL;

-- Update RLS policies
ALTER POLICY "Enable read access for all users" ON public.lessons
    USING (true);  -- Everyone can read all lessons

-- Enable RLS
ALTER TABLE public.lessons FORCE ROW LEVEL SECURITY;
