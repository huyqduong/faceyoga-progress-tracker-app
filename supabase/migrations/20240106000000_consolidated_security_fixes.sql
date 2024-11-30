-- Consolidated security fixes for Face Yoga Progress Tracker
-- This migration includes:
-- 1. Profile policies
-- 2. Exercise policies and procedures
-- 3. Exercise history policies
-- 4. Admin check functions
-- 5. Exercise triggers

-- ============================================================
-- Profile Policies
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all profiles (needed for admin checks)
CREATE POLICY "Anyone can read profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Exercise Types and Procedures
-- ============================================================
-- Create type for exercise updates
CREATE TYPE public.exercise_update AS (
  title text,
  duration text,
  target_area text,
  description text,
  image_url text,
  video_url text,
  category text,
  difficulty text,
  instructions text[],
  benefits text[]
);

-- Create secure procedure for updating exercises
CREATE OR REPLACE FUNCTION update_exercise(
  exercise_id uuid,
  exercise_data exercise_update,
  auth_uid uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin boolean;
  updated_exercise json;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth_uid
    AND role = 'admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can update exercises';
  END IF;

  -- Update the exercise
  UPDATE exercises
  SET
    title = COALESCE(exercise_data.title, title),
    duration = COALESCE(exercise_data.duration, duration),
    target_area = COALESCE(exercise_data.target_area, target_area),
    description = COALESCE(exercise_data.description, description),
    image_url = COALESCE(exercise_data.image_url, image_url),
    video_url = COALESCE(exercise_data.video_url, video_url),
    category = COALESCE(exercise_data.category, category),
    difficulty = COALESCE(exercise_data.difficulty, difficulty),
    instructions = COALESCE(exercise_data.instructions, instructions),
    benefits = COALESCE(exercise_data.benefits, benefits),
    updated_at = now()
  WHERE id = exercise_id
  RETURNING to_json(exercises.*) INTO updated_exercise;

  RETURN updated_exercise;
END;
$$;

-- ============================================================
-- Exercise Policies
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read exercises" ON exercises;
DROP POLICY IF EXISTS "Only admins can insert exercises" ON exercises;
DROP POLICY IF EXISTS "Only admins can update exercises" ON exercises;
DROP POLICY IF EXISTS "Only admins can delete exercises" ON exercises;

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read exercises
CREATE POLICY "Anyone can read exercises"
ON exercises FOR SELECT
TO authenticated
USING (true);

-- Admin-only modifications using secure function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies using the is_admin function
CREATE POLICY "Only admins can insert exercises"
ON exercises FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete exercises"
ON exercises FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================================
-- Exercise History Policies
-- ============================================================
DROP POLICY IF EXISTS "Users can read their own exercise history" ON exercise_history;
DROP POLICY IF EXISTS "Users can insert their own exercise history" ON exercise_history;
DROP POLICY IF EXISTS "Users can update their own exercise history" ON exercise_history;
DROP POLICY IF EXISTS "Users can delete their own exercise history" ON exercise_history;

ALTER TABLE exercise_history ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own exercise history
CREATE POLICY "Users can read their own exercise history"
ON exercise_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert their own exercise history
CREATE POLICY "Users can insert their own exercise history"
ON exercise_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own exercise history
CREATE POLICY "Users can update their own exercise history"
ON exercise_history FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own exercise history
CREATE POLICY "Users can delete their own exercise history"
ON exercise_history FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- Exercise History Triggers
-- ============================================================
DROP TRIGGER IF EXISTS on_exercise_history_insert ON exercise_history;
DROP FUNCTION IF EXISTS update_user_exercise_stats CASCADE;

-- Create function to update user stats
CREATE OR REPLACE FUNCTION update_user_exercise_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user stats in profiles table
  UPDATE profiles
  SET 
    exercises_done = exercises_done + 1,
    practice_time = practice_time + NEW.duration
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for exercise history
CREATE TRIGGER on_exercise_history_insert
  AFTER INSERT ON exercise_history
  FOR EACH ROW
  EXECUTE FUNCTION update_user_exercise_stats();
