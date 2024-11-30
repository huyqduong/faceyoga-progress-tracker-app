-- Create a type for exercise updates
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

-- Create a function to update exercises
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
