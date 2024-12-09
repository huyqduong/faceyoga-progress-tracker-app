-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.section_lessons CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    duration text NOT NULL,
    description text NOT NULL,
    image_url text NOT NULL,
    video_url text,
    difficulty text NOT NULL,
    instructions text[] DEFAULT '{}'::text[] NOT NULL,
    benefits text[] DEFAULT '{}'::text[] NOT NULL,
    category text NOT NULL,
    target_area text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create section_lessons table
CREATE TABLE IF NOT EXISTS public.section_lessons (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    section_id uuid REFERENCES public.course_sections(id) ON DELETE CASCADE,
    lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
    order_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(section_id, lesson_id)
);

-- Migrate data from exercises to lessons with the same IDs
INSERT INTO public.lessons (
    id,
    title,
    duration,
    description,
    image_url,
    video_url,
    difficulty,
    instructions,
    benefits,
    category,
    target_area,
    created_at,
    updated_at
)
SELECT 
    id,  -- Keep the same ID from exercises
    title,
    COALESCE(duration, '5 minutes'),
    COALESCE(description, ''),
    COALESCE(image_url, ''),
    video_url,
    COALESCE(difficulty, 'Beginner'),
    COALESCE(instructions, '{}'::text[]),
    COALESCE(benefits, '{}'::text[]),
    COALESCE(category, 'General'),
    COALESCE(target_area, 'Face'),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
FROM public.exercises;

-- Migrate data from section_exercises to section_lessons, keeping the same exercise/lesson IDs
INSERT INTO public.section_lessons (
    section_id,
    lesson_id,  -- Use the same ID that was in exercise_id
    order_id
)
SELECT 
    section_id,
    exercise_id,  -- This will match the lesson ID since we kept the same IDs
    COALESCE(order_index, 0)
FROM public.section_exercises;

-- Add RLS policies for lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.lessons
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.lessons
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.lessons
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON public.lessons
    FOR DELETE
    TO authenticated
    USING (true);

-- Add RLS policies for section_lessons
ALTER TABLE public.section_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.section_lessons
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.section_lessons
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.section_lessons
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON public.section_lessons
    FOR DELETE
    TO authenticated
    USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS section_lessons_section_id_idx ON public.section_lessons(section_id);
CREATE INDEX IF NOT EXISTS section_lessons_lesson_id_idx ON public.section_lessons(lesson_id);
CREATE INDEX IF NOT EXISTS section_lessons_order_id_idx ON public.section_lessons(order_id);
CREATE INDEX IF NOT EXISTS lessons_category_idx ON public.lessons(category);
CREATE INDEX IF NOT EXISTS lessons_target_area_idx ON public.lessons(target_area);
