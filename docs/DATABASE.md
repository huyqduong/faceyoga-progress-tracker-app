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

#### Exercises Table
Stores exercise definitions and content.

**Policies:**
- `Anyone can read exercises`: Authenticated users can read all exercises
- `Only admins can insert exercises`: Only admin users can create new exercises
- `Only admins can delete exercises`: Only admin users can delete exercises

**Note:** Exercise updates are handled through a secure stored procedure.

#### Exercise History Table
Tracks user exercise completion and progress.

**Policies:**
- `Users can read their own exercise history`: Users can only view their own history
- `Users can insert their own exercise history`: Users can only add to their own history
- `Users can update their own exercise history`: Users can only update their own history
- `Users can delete their own exercise history`: Users can only delete their own history

### Stored Procedures

#### update_exercise
Secure procedure for updating exercises with admin checks.

```sql
update_exercise(
  exercise_id: uuid,
  exercise_data: exercise_update,
  auth_uid: uuid
) returns json
```

**Parameters:**
- `exercise_id`: ID of the exercise to update
- `exercise_data`: Exercise data in the exercise_update type format
- `auth_uid`: ID of the user making the update

**Security:**
- Runs with SECURITY DEFINER
- Checks admin status before allowing updates
- Returns updated exercise as JSON

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

#### on_exercise_history_insert
Updates user statistics when exercises are completed.

**Function:** `update_user_exercise_stats()`
- Updates exercises_done count
- Updates total practice time
- Runs with SECURITY DEFINER

## Types

### exercise_update
Custom type for exercise updates with the following fields:
- title: text
- duration: text
- target_area: text
- description: text
- image_url: text
- video_url: text
- category: text
- difficulty: text
- instructions: text[]
- benefits: text[]

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
1. Implemented secure exercise update procedure
2. Added proper RLS policies for all tables
3. Fixed permission issues with admin checks
4. Added exercise history tracking with secure triggers
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
