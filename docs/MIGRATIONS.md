# Database Migrations Documentation

This document tracks all database migrations and their purposes.

## December 9, 2023 Updates

### 1. Add Practice Time to Profiles
**File:** `20231209_add_practice_time_to_profiles.sql`

Added columns to track exercise completion and practice time:
- `total_practice_time` (integer) - Total minutes spent practicing
- `exercises_done` (integer) - Total number of completed exercises

Also includes a data migration to populate these columns from existing lesson history.

### 2. Migrate Exercise History to Lesson History
**File:** `20231209_migrate_exercise_history_to_lesson_history.sql`

Created a new `lesson_history` table to replace `exercise_history`:
- Improved schema with proper foreign key relationships
- Added practice time tracking
- Maintained completion timestamps
- Migrated existing exercise history data

### 3. Add Last Lesson Completed At to Profiles
**File:** `20231209_add_last_lesson_completed_at_to_profiles.sql`

Added columns for improved streak tracking:
- `last_lesson_completed_at` (timestamp) - When the user last completed a lesson
- `streak` (integer) - Current daily practice streak

Includes data migration to set initial values based on lesson history.

## Schema Changes Summary

### Profiles Table Updates
```sql
ALTER TABLE public.profiles 
ADD COLUMN total_practice_time integer DEFAULT 0 NOT NULL;

ALTER TABLE public.profiles 
ADD COLUMN exercises_done integer DEFAULT 0 NOT NULL;

ALTER TABLE public.profiles 
ADD COLUMN last_lesson_completed_at timestamp with time zone;

ALTER TABLE public.profiles 
ADD COLUMN streak integer DEFAULT 0 NOT NULL;
```

### New Lesson History Table
```sql
CREATE TABLE public.lesson_history (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    practice_time integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## Running Migrations

To apply these migrations, run them in the following order:

1. First, add practice time columns:
```bash
psql -U postgres -d your_database_name -f supabase/migrations/20231209_add_practice_time_to_profiles.sql
```

2. Then, migrate exercise history:
```bash
psql -U postgres -d your_database_name -f supabase/migrations/20231209_migrate_exercise_history_to_lesson_history.sql
```

3. Finally, add streak tracking:
```bash
psql -U postgres -d your_database_name -f supabase/migrations/20231209_add_last_lesson_completed_at_to_profiles.sql
```
