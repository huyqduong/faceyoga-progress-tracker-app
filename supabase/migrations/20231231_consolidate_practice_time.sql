-- Update practice_time with total_practice_time where practice_time is null or 0
UPDATE profiles
SET practice_time = COALESCE(total_practice_time, 0)
WHERE practice_time IS NULL OR practice_time = 0;

-- For profiles that have both values, take the maximum
UPDATE profiles
SET practice_time = GREATEST(COALESCE(practice_time, 0), COALESCE(total_practice_time, 0))
WHERE practice_time IS NOT NULL AND total_practice_time IS NOT NULL;

-- Drop the total_practice_time column
ALTER TABLE profiles
DROP COLUMN IF EXISTS total_practice_time;

-- Ensure practice_time has a default value of 0 and is not null
ALTER TABLE profiles
ALTER COLUMN practice_time SET DEFAULT 0,
ALTER COLUMN practice_time SET NOT NULL;
