# Rewards System

The rewards system tracks user progress and achievements in the Face Yoga app. It includes points, levels, streaks, and achievements.

## Points and Levels

Users can earn points by completing goals and exercises. Points determine the user's level:

- **Beginner**: 0-499 points
- **Intermediate**: 500-1,499 points
- **Advanced**: 1,500+ points

## Achievements

Achievements are awarded automatically when users reach specific milestones:

| Achievement | Description | Required Points | Badge |
|------------|-------------|-----------------|-------|
| Beginner Yogi | Complete your first exercise | 100 | Mint green checkmark |
| Dedicated Practitioner | Reach intermediate level | 500 | Yellow trophy |
| Advanced Yogi | Reach advanced level | 1,500 | Pink star |
| Consistency Master | Maintain a 7-day streak | - | Blue lightning bolt |

## Database Schema

### user_rewards
```sql
create table user_rewards (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    total_points integer default 0,
    current_level text default 'beginner',
    streak_days integer default 0,
    last_activity_date date,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
```

### achievements
```sql
create table achievements (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    required_points integer not null,
    badge_image_url text,
    created_at timestamp with time zone default now()
);
```

### user_achievements
```sql
create table user_achievements (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    achievement_id uuid references achievements(id) on delete cascade,
    earned_at timestamp with time zone default now(),
    unique(user_id, achievement_id)
);
```

## Automatic Updates

The system uses database triggers to automatically:
1. Update user levels based on total points
2. Award achievements when milestones are reached
3. Track and update streak days

## Implementation Details

### Points Calculation
- Points are calculated from completed goals
- Each goal has a `points_reward` value
- Total points are updated in `user_rewards` table

### Streak Tracking
- Streaks are tracked daily
- A streak increases when user completes goals on consecutive days
- Streaks reset if user misses a day

### Achievement System
- Achievements are checked and awarded automatically via database triggers
- Each achievement has a custom SVG badge
- Badges are displayed in the user's profile
- Achievements are ordered by earn date (newest first)

## Frontend Components

### UserProfile
- Displays current level and progress
- Shows total points, achievements count, and streak days
- Lists all earned achievements with badges

### Reward Store
- Manages reward state using Zustand
- Handles fetching and updating of rewards data
- Automatically syncs with backend changes

## Asset Structure

Achievement badges are stored in `/public/assets/badges/`:
- `beginner-badge.svg`: Mint green checkmark for first achievement
- `intermediate-badge.svg`: Yellow trophy for reaching intermediate
- `advanced-badge.svg`: Pink star for reaching advanced
- `streak-badge.svg`: Blue lightning bolt for streak achievement
