-- Create user_rewards table
create table if not exists user_rewards (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    total_points integer default 0,
    current_level text default 'beginner',
    streak_days integer default 0,
    last_activity_date date,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create achievements table
create table if not exists achievements (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    required_points integer not null,
    badge_image_url text,
    created_at timestamp with time zone default now()
);

-- Create user_achievements table
create table if not exists user_achievements (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    achievement_id uuid references achievements(id) on delete cascade,
    earned_at timestamp with time zone default now(),
    unique(user_id, achievement_id)
);

-- Add indexes
create index if not exists user_rewards_user_id_idx on user_rewards(user_id);
create index if not exists user_achievements_user_id_idx on user_achievements(user_id);
create index if not exists user_achievements_achievement_id_idx on user_achievements(achievement_id);

-- Function to update user level
create or replace function update_user_level()
returns trigger as $$
begin
    new.current_level := 
        case
            when new.total_points >= 1500 then 'advanced'
            when new.total_points >= 500 then 'intermediate'
            else 'beginner'
        end;
    return new;
end;
$$ language plpgsql;

-- Trigger to automatically update user level
create trigger update_user_level_trigger
    before insert or update of total_points on user_rewards
    for each row
    execute function update_user_level();
