-- Create lessons bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('lessons', 'lessons', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public access to lesson images
CREATE POLICY "Give public access to lesson images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'lessons');

-- Allow authenticated users to upload lesson images
CREATE POLICY "Allow authenticated users to upload lesson images" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'lessons');

-- Update lessons table RLS policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.lessons;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.lessons;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.lessons;

-- Add admin-only policies for lessons table
CREATE POLICY "Enable insert for admin users only" ON public.lessons
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.profiles
            WHERE role = 'admin'
        )
    );

CREATE POLICY "Enable update for admin users only" ON public.lessons
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles
            WHERE role = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.profiles
            WHERE role = 'admin'
        )
    );

CREATE POLICY "Enable delete for admin users only" ON public.lessons
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles
            WHERE role = 'admin'
        )
    );
