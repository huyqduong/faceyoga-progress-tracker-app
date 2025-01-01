-- Drop existing policy
drop policy if exists "Admin can manage goal milestones" on goal_milestones;

-- Create new policy that uses the correct admin check
create policy "Admin can manage goal milestones"
    on goal_milestones for all
    using (
        exists (
            select 1 from profiles
            where profiles.user_id = auth.uid()
            and profiles.role = 'admin'
        )
    );
