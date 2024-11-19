-- Ensure progress bucket exists with proper configuration
DO $$
BEGIN
    -- Drop existing bucket if it exists
    BEGIN
        DELETE FROM storage.buckets WHERE id = 'progress';
    EXCEPTION WHEN OTHERS THEN
        -- Ignore if bucket doesn't exist
    END;
    
    -- Create progress bucket with proper configuration
    INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    ) VALUES (
        'progress',
        'progress',
        true,
        5242880, -- 5MB limit
        ARRAY['image/jpeg', 'image/png', 'image/webp']
    );
END $$;

-- Enable RLS for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Progress images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload progress images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete progress images" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Progress images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'progress');

CREATE POLICY "Users can upload progress images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'progress'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete progress images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'progress'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Ensure user_progress table exists with proper structure
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Update user_progress policies
DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can delete their own progress" ON user_progress;

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