-- Insert sample goal milestones for existing goals
insert into goal_milestones (goal_id, title, description, target_value, reward_points)
select 
    id as goal_id,
    'Initial Progress' as title,
    'Complete your first week of lessons' as description,
    25 as target_value,
    50 as reward_points
from goals;

insert into goal_milestones (goal_id, title, description, target_value, reward_points)
select 
    id as goal_id,
    'Intermediate Achievement' as title,
    'Maintain consistent practice for a month' as description,
    50 as target_value,
    100 as reward_points
from goals;

insert into goal_milestones (goal_id, title, description, target_value, reward_points)
select 
    id as goal_id,
    'Advanced Milestone' as title,
    'Master the techniques and see visible results' as description,
    100 as target_value,
    200 as reward_points
from goals;

-- Update existing goals with new fields
update goals
set 
    category = case 
        when description ilike '%tone%' then 'Toning'
        when description ilike '%lift%' then 'Lifting'
        when description ilike '%wrinkle%' then 'Anti-aging'
        else 'General'
    end,
    difficulty = case 
        when description ilike '%beginner%' then 'beginner'
        when description ilike '%advanced%' then 'advanced'
        else 'intermediate'
    end,
    estimated_duration = (case 
        when description ilike '%quick%' then '14 days'
        when description ilike '%intensive%' then '84 days'
        else '56 days'
    end)::interval,
    points_reward = floor(random() * 500 + 100)::integer;

-- Insert sample progress data for the first user's goals
with first_user_goals as (
    select ug.user_id, g.id as goal_id
    from user_goals ug
    cross join lateral unnest(ug.goals) as goal_name
    join goals g on g.label = goal_name::text
    limit 5
)
insert into goal_progress (user_id, goal_id, progress_value, milestone_reached, status, notes)
select 
    user_id,
    goal_id,
    floor(random() * 75 + 25)::integer as progress_value,
    floor(random() * 2)::integer as milestone_reached,
    case floor(random() * 4)::integer
        when 0 then 'not_started'
        when 1 then 'in_progress'
        when 2 then 'completed'
        else 'paused'
    end as status,
    'Sample progress data for testing' as notes
from first_user_goals;

-- Create lesson-goal mappings
insert into lesson_goal_mapping (lesson_id, goal_id, contribution_weight)
select 
    l.id as lesson_id,
    g.id as goal_id,
    floor(random() * 3 + 1)::integer as contribution_weight
from lessons l
cross join goals g
where random() < 0.3; -- Only create mappings for 30% of possible combinations
