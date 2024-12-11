-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create new tables
create table if not exists goal_progress (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    goal_id uuid references goals(id) on delete cascade,
    progress_value integer not null default 0,
    milestone_reached integer not null default 0,
    last_updated timestamp with time zone default now(),
    created_at timestamp with time zone default now(),
    notes text,
    status text check (status in ('not_started', 'in_progress', 'completed', 'paused'))
);

create table if not exists goal_milestones (
    id uuid default uuid_generate_v4() primary key,
    goal_id uuid references goals(id) on delete cascade,
    title text not null,
    description text,
    target_value integer not null,
    reward_points integer default 0,
    created_at timestamp with time zone default now()
);

create table if not exists lesson_goal_mapping (
    id uuid default uuid_generate_v4() primary key,
    lesson_id uuid references lessons(id) on delete cascade,
    goal_id uuid references goals(id) on delete cascade,
    contribution_weight integer default 1,
    created_at timestamp with time zone default now(),
    unique(lesson_id, goal_id)
);

-- Add indexes
create index if not exists goal_progress_user_id_idx on goal_progress(user_id);
create index if not exists goal_progress_goal_id_idx on goal_progress(goal_id);
create index if not exists goal_milestones_goal_id_idx on goal_milestones(goal_id);
create index if not exists lesson_goal_mapping_lesson_id_idx on lesson_goal_mapping(lesson_id);
create index if not exists lesson_goal_mapping_goal_id_idx on lesson_goal_mapping(goal_id);

-- Update existing tables
alter table goals 
    add column if not exists category text,
    add column if not exists difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
    add column if not exists estimated_duration interval,
    add column if not exists points_reward integer default 0;

alter table user_goals 
    add column if not exists priority integer default 1,
    add column if not exists start_date timestamp with time zone default now(),
    add column if not exists target_date timestamp with time zone,
    add column if not exists reminder_frequency text check (reminder_frequency in ('daily', 'weekly', 'monthly', 'none'));

-- Enable RLS
alter table goal_progress enable row level security;
alter table goal_milestones enable row level security;
alter table lesson_goal_mapping enable row level security;

-- Add RLS policies
create policy "Users can view their own goal progress"
    on goal_progress for select
    using (auth.uid() = user_id);

create policy "Users can insert their own goal progress"
    on goal_progress for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own goal progress"
    on goal_progress for update
    using (auth.uid() = user_id);

create policy "Everyone can view goal milestones"
    on goal_milestones for select
    to authenticated
    using (true);

create policy "Everyone can view lesson goal mappings"
    on lesson_goal_mapping for select
    to authenticated
    using (true);

-- Admin policies for managing data
create policy "Admin can manage goal milestones"
    on goal_milestones for all
    using (auth.uid() in (select id from admin_users));

create policy "Admin can manage lesson goal mappings"
    on lesson_goal_mapping for all
    using (auth.uid() in (select id from admin_users));
