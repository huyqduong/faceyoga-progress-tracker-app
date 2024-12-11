-- Function to update goal progress atomically
create or replace function update_goal_progress(
  p_user_id uuid,
  p_goal_id uuid,
  p_progress_value integer
)
returns void
language plpgsql
security definer
as $$
declare
  v_milestones_reached integer;
begin
  -- Calculate milestones reached
  select count(*)
  into v_milestones_reached
  from goal_milestones
  where goal_id = p_goal_id
    and target_value <= p_progress_value;

  -- Update or insert progress record
  insert into goal_progress (
    user_id,
    goal_id,
    progress_value,
    milestone_reached,
    last_updated
  )
  values (
    p_user_id,
    p_goal_id,
    p_progress_value,
    v_milestones_reached,
    now()
  )
  on conflict (user_id, goal_id)
  do update set
    progress_value = p_progress_value,
    milestone_reached = v_milestones_reached,
    last_updated = now();
end;
$$;
