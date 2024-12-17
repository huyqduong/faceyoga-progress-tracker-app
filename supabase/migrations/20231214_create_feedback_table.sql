-- Create feedback table
create table if not exists public.feedback (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text not null,
    type text not null check (type in ('bug', 'feature', 'general')),
    user_id uuid references auth.users(id),
    email text,
    status text default 'new' check (status in ('new', 'in_progress', 'resolved', 'closed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.feedback enable row level security;

-- Create policies
create policy "Users can view their own feedback"
    on public.feedback for select
    using (auth.uid() = user_id);

create policy "Users can create feedback"
    on public.feedback for insert
    with check (auth.uid() = user_id);

-- Create function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

-- Create trigger for updated_at
create trigger handle_updated_at
    before update on public.feedback
    for each row
    execute function public.handle_updated_at();
