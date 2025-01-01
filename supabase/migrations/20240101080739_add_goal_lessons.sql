-- Create goal_lessons junction table
create table public.goal_lessons (
    id uuid default gen_random_uuid() primary key,
    goal_id uuid references public.goals(id) on delete cascade not null,
    lesson_id uuid references public.lessons(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    created_by uuid references auth.users(id) on delete set null,
    unique(goal_id, lesson_id)
);

-- Add RLS policies
alter table public.goal_lessons enable row level security;

-- Allow all authenticated users to view goal lessons
create policy "Goal lessons are viewable by all authenticated users"
on public.goal_lessons for select
to authenticated
using (true);

-- Allow only admins to manage goal lessons
create policy "Only admins can insert goal lessons"
on public.goal_lessons for insert
to authenticated
with check (
    exists (
        select 1 from public.profiles
        where profiles.user_id = auth.uid()
        and profiles.role = 'admin'
    )
);

create policy "Only admins can update goal lessons"
on public.goal_lessons for update
to authenticated
using (
    exists (
        select 1 from public.profiles
        where profiles.user_id = auth.uid()
        and profiles.role = 'admin'
    )
) with check (
    exists (
        select 1 from public.profiles
        where profiles.user_id = auth.uid()
        and profiles.role = 'admin'
    )
);

create policy "Only admins can delete goal lessons"
on public.goal_lessons for delete
to authenticated
using (
    exists (
        select 1 from public.profiles
        where profiles.user_id = auth.uid()
        and profiles.role = 'admin'
    )
);
