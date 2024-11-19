-- First, ensure the storage extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recreate the progress bucket with proper configuration
DO $$
BEGIN
    -- Drop existing bucket if it exists
    BEGIN
        DELETE FROM storage.buckets WHERE id = 'progress';
    EXCEPTION WHEN OTHERS THEN
        -- Ignore if bucket doesn't exist
    END;
    
    -- Create the bucket with proper configuration
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'progress',
        'progress',
        true,
        5242880, -- 5MB limit
        ARRAY['image/jpeg', 'image/png', 'image/webp']
    );
END $$;

-- Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Progress images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload progress images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete progress images" ON storage.objects;

-- Create new storage policies
CREATE POLICY "Progress images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'progress');

CREATE POLICY "Users can upload progress images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'progress'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (CASE 
        WHEN RIGHT(name, 4) = '.jpg' THEN true
        WHEN RIGHT(name, 5) = '.jpeg' THEN true
        WHEN RIGHT(name, 4) = '.png' THEN true
        WHEN RIGHT(name, 5) = '.webp' THEN true
        ELSE false
    END)
);

CREATE POLICY "Users can delete their progress images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'progress'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Recreate user_progress table with proper structure
DROP TABLE IF EXISTS user_progress CASCADE;
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user_progress
CREATE POLICY "Users can view their own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
ON user_progress FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_created_at ON user_progress(created_at DESC);

-- Grant necessary permissions
GRANT ALL ON user_progress TO authenticated;
GRANT USAGE ON SEQUENCE user_progress_id_seq TO authenticated;