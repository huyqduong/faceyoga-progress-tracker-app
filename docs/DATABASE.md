# Face Yoga Progress Tracker Database Documentation

## Overview
This document outlines the database structure, security policies, and procedures for the Face Yoga Progress Tracker application.

## Security Model

### Row Level Security (RLS)
The application uses Supabase's Row Level Security to enforce access control at the database level. Each table has specific policies that determine who can perform various operations.

### Tables and Policies

#### Profiles Table
Stores user profile information and statistics.

**Policies:**
- `Anyone can read profiles`: Authenticated users can read all profiles (needed for admin checks)
- `Users can update their own profile`: Users can only update their own profile
- `Users can insert their own profile`: Users can only create their own profile

#### Lessons Table
Stores lesson information.

**Policies:**
- `Anyone can read lessons`: Authenticated users can read all lessons
- `Only admins can insert lessons`: Only admin users can create new lessons
- `Only admins can delete lessons`: Only admin users can delete lessons

#### Lesson History Table
Tracks user lesson completion history.

**Policies:**
- `Users can read their own lesson history`: Users can only view their own history
- `Users can insert their own lesson history`: Users can only add to their own history
- `Users can update their own lesson history`: Users can only update their own history
- `Users can delete their own lesson history`: Users can only delete their own history

#### Courses Table
Stores course information.

**Policies:**
- `Published courses are viewable by all authenticated users`: Authenticated users can read published courses
- `Draft courses are only viewable by admins`: Only admin users can read draft courses
- `Only admins can manage courses`: Only admin users can insert, update, or delete courses

#### Course Sections Table
Organizes lessons within courses.

**Policies:**
- `Anyone can read course sections`: Authenticated users can read all course sections
- `Only admins can manage course sections`: Only admin users can insert, update, or delete course sections

#### Section Lessons Table
Links lessons to course sections.

**Policies:**
- `Anyone can read section lessons`: Authenticated users can read all section lessons
- `Only admins can manage section lessons`: Only admin users can insert, update, or delete section lessons

#### Course Purchases Table
Tracks course purchases by users.

**Policies:**
- `Users can view their own course purchases`: Users can only view their own course purchases
- `Only admins can view all course purchases`: Only admin users can view all course purchases

#### Goals Table
Stores the main goal definitions.

**Policies:**
- `Goals are viewable by all authenticated users`: Authenticated users can read all goals
- `Only admins can manage goals`: Only admin users can insert, update, or delete goals

#### Goal Milestones Table
Stores milestones for each goal with their target values.

**Policies:**
- `Anyone can read goal milestones`: Authenticated users can read all goal milestones
- `Only admins can manage goal milestones`: Only admin users can insert, update, or delete goal milestones

#### Goal Lessons Table
Links lessons to goals with contribution weights.

**Policies:**
- `Anyone can read goal lessons`: Authenticated users can read all goal lessons
- `Only admins can manage goal lessons`: Only admin users can insert, update, or delete goal lessons

#### Goal Progress Table
Tracks user progress for each goal.

**Policies:**
- `Users can view their own goal progress`: Users can only view their own goal progress
- `Only admins can view all goal progress`: Only admin users can view all goal progress

#### App Settings Table
Stores application-wide settings.

**Policies:**
- `Settings are viewable by all authenticated users`: Authenticated users can read all settings
- `Only admins can manage settings`: Only admin users can insert, update, or delete settings

#### Feedback Table
Stores user feedback and suggestions.

**Policies:**
- `Users can submit feedback`: Users can only insert their own feedback
- `Users can view their own feedback`: Users can only view their own feedback
- `Only admins can view all feedback`: Only admin users can view all feedback
- `Only admins can update feedback status`: Only admin users can update feedback status

### Progress Flow

When a lesson is completed:
1. System looks up all goals linked to the lesson in `goal_lessons`
2. For each linked goal:
   - Adds the lesson's `contribution_weight` to the goal's `progress_value`
   - Updates `milestone_reached` based on achieved target values
   - Updates goal `status` if all milestones are reached
3. Updates user's `lessons_completed` and `practice_time_minutes` in profiles
4. Updates `last_lesson_completed_at` in profiles

Example:
```sql
-- Find goals linked to completed lesson
select gl.* 
from goal_lessons gl
where gl.lesson_id = 'completed_lesson_id';

-- Update progress for each linked goal
update goal_progress
set 
    progress_value = progress_value + goal_lessons.contribution_weight,
    milestone_reached = (
        select count(*) 
        from goal_milestones gm 
        where gm.goal_id = goal_progress.goal_id 
        and gm.target_value <= (progress_value + goal_lessons.contribution_weight)
    ),
    status = case 
        when (select count(*) from goal_milestones where goal_id = goal_progress.goal_id) = 
             (select count(*) from goal_milestones where goal_id = goal_progress.goal_id 
              and target_value <= (progress_value + goal_lessons.contribution_weight))
        then 'completed'
        else 'in_progress'
    end,
    last_updated = now()
from goal_lessons
where goal_lessons.goal_id = goal_progress.goal_id
and goal_lessons.lesson_id = 'completed_lesson_id';

-- Update user profile
update profiles
set 
    lessons_completed = lessons_completed + 1,
    practice_time_minutes = practice_time_minutes + (
        select duration_minutes from lessons where id = 'completed_lesson_id'
    ),
    last_lesson_completed_at = now()
where id = 'user_id';
```

### Stored Procedures

#### update_lesson
Secure procedure for updating lessons with admin checks.

```sql
update_lesson(
  lesson_id: uuid,
  lesson_data: lesson_update,
  auth_uid: uuid
) returns json
```

**Parameters:**
- `lesson_id`: ID of the lesson to update
- `lesson_data`: Lesson data in the lesson_update type format
- `auth_uid`: ID of the user making the update

**Security:**
- Runs with SECURITY DEFINER
- Checks admin status before allowing updates
- Returns updated lesson as JSON

#### is_admin
Function to check if a user has admin privileges.

```sql
is_admin() returns boolean
```

**Security:**
- Runs with SECURITY DEFINER
- Checks user role in profiles table
- Used in RLS policies

### Triggers

#### on_lesson_history_insert
Updates user statistics when lessons are completed.

**Function:** `update_user_lesson_stats()`
- Updates lessons_completed count
- Updates total practice time
- Runs with SECURITY DEFINER

## Types

### lesson_update
Custom type for lesson updates with the following fields:
- title: text
- description: text
- image_url: text
- video_url: text
- duration_minutes: integer
- difficulty: text
- is_premium: boolean

## Best Practices

1. **Security:**
   - All sensitive operations use SECURITY DEFINER functions
   - Admin checks are done server-side
   - No direct access to sensitive tables
   - RLS policies enforce access control

2. **Performance:**
   - Efficient triggers for updating statistics
   - Proper indexing on frequently queried fields
   - Optimized stored procedures

3. **Maintainability:**
   - Clear naming conventions
   - Documented policies and procedures
   - Type safety with custom types
   - Consolidated security policies

## Recent Changes

### Security Fixes (2024-01-06)
1. Implemented secure lesson update procedure
2. Added proper RLS policies for all tables
3. Fixed permission issues with admin checks
4. Added lesson history tracking with secure triggers
5. Consolidated security policies and procedures

## Future Considerations

1. **Potential Improvements:**
   - Add more sophisticated caching mechanisms
   - Implement audit logging for admin actions
   - Add more granular permission levels
   - Enhance backup and recovery procedures

2. **Monitoring:**
   - Track query performance
   - Monitor trigger execution times
   - Log policy violations
   - Track user statistics updates
