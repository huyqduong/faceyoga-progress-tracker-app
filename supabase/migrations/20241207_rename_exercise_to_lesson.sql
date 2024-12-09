-- Rename exercises table to lessons
ALTER TABLE exercises RENAME TO lessons;

-- Rename exercises_id_seq sequence
ALTER SEQUENCE exercises_id_seq RENAME TO lessons_id_seq;

-- Drop existing policies
DROP POLICY IF EXISTS "Exercises are viewable by everyone" ON lessons;
DROP POLICY IF EXISTS "Exercises are publicly readable" ON lessons;

-- Create new policies with updated names
CREATE POLICY "Lessons are viewable by everyone" 
ON lessons
FOR SELECT 
USING (true);

-- Update foreign key constraints in exercise_history table
ALTER TABLE exercise_history RENAME TO lesson_history;
ALTER TABLE lesson_history RENAME COLUMN exercise_id TO lesson_id;
ALTER TABLE lesson_history 
  DROP CONSTRAINT IF EXISTS exercise_history_exercise_id_fkey,
  ADD CONSTRAINT lesson_history_lesson_id_fkey 
    FOREIGN KEY (lesson_id) 
    REFERENCES lessons(id) 
    ON DELETE CASCADE;

-- Drop existing policies on exercise_history
DROP POLICY IF EXISTS "Exercise history is viewable by creator" ON lesson_history;
DROP POLICY IF EXISTS "Exercise history is insertable by authenticated users" ON lesson_history;

-- Create new policies for lesson_history
CREATE POLICY "Lesson history is viewable by creator"
ON lesson_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Lesson history is insertable by authenticated users"
ON lesson_history
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Update type names if any
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'exercise_type'
    ) THEN
        ALTER TYPE exercise_type RENAME TO lesson_type;
    END IF;
END$$;
