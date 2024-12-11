# Database Schema Updates for Enhanced Goal Tracking

## New Tables

### 1. goal_progress
```sql
create table goal_progress (
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

-- Add indexes
create index goal_progress_user_id_idx on goal_progress(user_id);
create index goal_progress_goal_id_idx on goal_progress(goal_id);
```

### 2. goal_milestones
```sql
create table goal_milestones (
    id uuid default uuid_generate_v4() primary key,
    goal_id uuid references goals(id) on delete cascade,
    title text not null,
    description text,
    target_value integer not null,
    reward_points integer default 0,
    created_at timestamp with time zone default now()
);

-- Add index
create index goal_milestones_goal_id_idx on goal_milestones(goal_id);
```

### 3. exercise_goal_mapping
```sql
create table exercise_goal_mapping (
    id uuid default uuid_generate_v4() primary key,
    exercise_id uuid references exercises(id) on delete cascade,
    goal_id uuid references goals(id) on delete cascade,
    contribution_weight integer default 1,
    created_at timestamp with time zone default now(),
    unique(exercise_id, goal_id)
);

-- Add indexes
create index exercise_goal_mapping_exercise_id_idx on exercise_goal_mapping(exercise_id);
create index exercise_goal_mapping_goal_id_idx on exercise_goal_mapping(goal_id);
```

## Updates to Existing Tables

### 1. goals table
```sql
-- Add new columns to goals table
alter table goals add column if not exists category text;
alter table goals add column if not exists difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced'));
alter table goals add column if not exists estimated_duration interval;
alter table goals add column if not exists points_reward integer default 0;
```

### 2. user_goals table
```sql
-- Add new columns to user_goals table
alter table user_goals add column if not exists priority integer default 1;
alter table user_goals add column if not exists start_date timestamp with time zone default now();
alter table user_goals add column if not exists target_date timestamp with time zone;
alter table user_goals add column if not exists reminder_frequency text check (reminder_frequency in ('daily', 'weekly', 'monthly', 'none'));
```

## RLS (Row Level Security) Policies

```sql
-- goal_progress policies
alter table goal_progress enable row level security;

create policy "Users can view their own goal progress"
    on goal_progress for select
    using (auth.uid() = user_id);

create policy "Users can insert their own goal progress"
    on goal_progress for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own goal progress"
    on goal_progress for update
    using (auth.uid() = user_id);

-- goal_milestones policies
alter table goal_milestones enable row level security;

create policy "Everyone can view goal milestones"
    on goal_milestones for select
    to authenticated
    using (true);

-- exercise_goal_mapping policies
alter table exercise_goal_mapping enable row level security;

create policy "Everyone can view exercise goal mappings"
    on exercise_goal_mapping for select
    to authenticated
    using (true);
```

## Migration Steps

1. Back up existing data
2. Execute schema updates in order:
   - Create new tables
   - Add indexes
   - Update existing tables
   - Add RLS policies
3. Migrate existing goal data to new schema
4. Verify data integrity
5. Update application code to use new schema
