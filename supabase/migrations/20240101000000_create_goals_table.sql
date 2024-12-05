-- Create goals table
create table if not exists public.goals (
    id uuid primary key default uuid_generate_v4(),
    label text not null,
    icon text not null,
    description text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.goals enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.goals
    for select
    to authenticated
    using (true);

create policy "Enable insert/update/delete for admins" on public.goals
    for all
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.user_id = auth.uid()
            and profiles.role = 'admin'
        )
    )
    with check (
        exists (
            select 1 from public.profiles
            where profiles.user_id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Create trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer;

create trigger handle_goals_updated_at
    before update on public.goals
    for each row
    execute procedure public.handle_updated_at();

-- Insert some default goals
insert into public.goals (label, icon, description) values
    ('Tone Jawline', 'Target', 'Strengthen and define your jawline muscles for a more sculpted appearance'),
    ('Reduce Puffiness', 'Clock', 'Decrease facial puffiness and improve circulation for a refreshed look'),
    ('Improve Elasticity', 'Sparkles', 'Enhance skin elasticity and reduce fine lines for a more youthful appearance'),
    ('Facial Symmetry', 'Heart', 'Work on balancing facial features for better symmetry and harmony'),
    ('Neck Toning', 'Star', 'Tone and strengthen neck muscles to reduce signs of aging');
