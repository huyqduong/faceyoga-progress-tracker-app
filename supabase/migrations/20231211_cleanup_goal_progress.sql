-- First, create a temporary table with the latest progress records
CREATE TEMP TABLE latest_progress AS
SELECT DISTINCT ON (user_id, goal_id)
    id,
    user_id,
    goal_id,
    progress_value,
    milestone_reached,
    status,
    last_updated
FROM goal_progress
ORDER BY user_id, goal_id, last_updated DESC;

-- Delete all records from goal_progress
DELETE FROM goal_progress;

-- Reinsert only the latest records
INSERT INTO goal_progress (
    id,
    user_id,
    goal_id,
    progress_value,
    milestone_reached,
    status,
    last_updated
)
SELECT 
    id,
    user_id,
    goal_id,
    progress_value,
    milestone_reached,
    status,
    last_updated
FROM latest_progress;

-- Now add the unique constraint
ALTER TABLE public.goal_progress
ADD CONSTRAINT goal_progress_user_goal_unique UNIQUE (user_id, goal_id);

-- Recreate the update_goal_progress function with proper constraint handling
CREATE OR REPLACE FUNCTION update_goal_progress(
  p_user_id uuid,
  p_goal_id uuid,
  p_progress_value integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_milestones_reached integer;
BEGIN
  -- Calculate milestones reached
  SELECT COUNT(*)
  INTO v_milestones_reached
  FROM goal_milestones
  WHERE goal_id = p_goal_id
    AND target_value <= p_progress_value;

  -- Update or insert progress record
  INSERT INTO goal_progress (
    user_id,
    goal_id,
    progress_value,
    milestone_reached,
    last_updated
  )
  VALUES (
    p_user_id,
    p_goal_id,
    p_progress_value,
    v_milestones_reached,
    now()
  )
  ON CONFLICT ON CONSTRAINT goal_progress_user_goal_unique
  DO UPDATE SET
    progress_value = EXCLUDED.progress_value,
    milestone_reached = EXCLUDED.milestone_reached,
    last_updated = EXCLUDED.last_updated;
END;
$$;
