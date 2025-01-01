-- Add contribution_weight column to goal_lessons
alter table public.goal_lessons
add column contribution_weight integer not null default 10;

-- Update existing records to have a default weight of 10
update public.goal_lessons
set contribution_weight = 10
where contribution_weight is null;
