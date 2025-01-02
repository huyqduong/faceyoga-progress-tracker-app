-- Insert default achievements
insert into achievements (title, description, required_points, badge_image_url)
values 
  ('Beginner Yogi', 'Complete your first exercise', 100, '/badges/beginner.png'),
  ('Dedicated Practitioner', 'Reach 500 points', 500, '/badges/intermediate.png'),
  ('Advanced Yogi', 'Reach 1500 points', 1500, '/badges/advanced.png'),
  ('Consistency Master', 'Maintain a 7-day streak', 0, '/badges/streak.png');

-- Function to check and award achievements
create or replace function check_and_award_achievements()
returns trigger as $$
declare
    achievement record;
begin
    -- Check point-based achievements
    for achievement in 
        select * from achievements 
        where required_points <= new.total_points
        and not exists (
            select 1 from user_achievements 
            where user_id = new.user_id 
            and achievement_id = achievements.id
        )
    loop
        insert into user_achievements (user_id, achievement_id)
        values (new.user_id, achievement.id);
    end loop;

    -- Check streak achievement
    if new.streak_days >= 7 and not exists (
        select 1 from user_achievements ua
        join achievements a on ua.achievement_id = a.id
        where ua.user_id = new.user_id
        and a.title = 'Consistency Master'
    ) then
        insert into user_achievements (user_id, achievement_id)
        select new.user_id, id from achievements
        where title = 'Consistency Master';
    end if;

    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically check and award achievements
drop trigger if exists check_achievements_trigger on user_rewards;
create trigger check_achievements_trigger
after update on user_rewards
for each row
execute function check_and_award_achievements();
