-- Create enum type for experience level
DO $$ BEGIN
    CREATE TYPE experience_level_type AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add experience_level column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS experience_level experience_level_type;

-- Update RLS policies to allow users to update their own experience_level
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
CREATE POLICY "Users can update their own profile."
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow experience_level to be null initially
COMMENT ON COLUMN profiles.experience_level IS 'User''s face yoga experience level. Can be beginner, intermediate, or advanced.';
