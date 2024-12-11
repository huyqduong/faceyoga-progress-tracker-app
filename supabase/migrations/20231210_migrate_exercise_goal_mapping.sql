-- Create lesson_goal_mapping table
CREATE TABLE IF NOT EXISTS public.lesson_goal_mapping (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    contribution_weight integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(goal_id, lesson_id)
);

-- Add RLS policies
ALTER TABLE public.lesson_goal_mapping ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lesson_goal_mapping' 
        AND policyname = 'Enable read access for authenticated users'
    ) THEN
        CREATE POLICY "Enable read access for authenticated users" ON public.lesson_goal_mapping
            FOR SELECT TO authenticated
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lesson_goal_mapping' 
        AND policyname = 'Enable insert for authenticated users'
    ) THEN
        CREATE POLICY "Enable insert for authenticated users" ON public.lesson_goal_mapping
            FOR INSERT TO authenticated
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lesson_goal_mapping' 
        AND policyname = 'Enable update for authenticated users'
    ) THEN
        CREATE POLICY "Enable update for authenticated users" ON public.lesson_goal_mapping
            FOR UPDATE TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lesson_goal_mapping' 
        AND policyname = 'Enable delete for authenticated users'
    ) THEN
        CREATE POLICY "Enable delete for authenticated users" ON public.lesson_goal_mapping
            FOR DELETE TO authenticated
            USING (true);
    END IF;
END $$;

-- Migrate data from exercise_goal_mapping to lesson_goal_mapping
INSERT INTO public.lesson_goal_mapping (goal_id, lesson_id, contribution_weight, created_at, updated_at)
SELECT 
    egm.goal_id,
    l.id as lesson_id,
    egm.contribution_weight,
    egm.created_at,
    timezone('utc'::text, now()) as updated_at
FROM public.exercise_goal_mapping egm
JOIN public.exercises e ON e.id = egm.exercise_id
JOIN public.lessons l ON l.title = e.title AND l.target_area = e.target_area
ON CONFLICT (goal_id, lesson_id) DO UPDATE 
SET contribution_weight = EXCLUDED.contribution_weight,
    updated_at = timezone('utc'::text, now());

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'handle_updated_at' 
        AND tgrelid = 'public.lesson_goal_mapping'::regclass
    ) THEN
        CREATE TRIGGER handle_updated_at
            BEFORE UPDATE ON public.lesson_goal_mapping
            FOR EACH ROW
            EXECUTE PROCEDURE public.handle_updated_at();
    END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lesson_goal_mapping_goal_id ON public.lesson_goal_mapping(goal_id);
CREATE INDEX IF NOT EXISTS idx_lesson_goal_mapping_lesson_id ON public.lesson_goal_mapping(lesson_id);

-- Drop exercise-related tables after migration
DROP TABLE IF EXISTS public.exercise_goal_mapping CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
