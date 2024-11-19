-- Create progress bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress', 'progress', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Progress storage policies
CREATE POLICY "Progress images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'progress' );

CREATE POLICY "Users can upload progress images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'progress'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create user_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user_progress
CREATE POLICY "Users can view their own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_created_at ON user_progress(created_at);