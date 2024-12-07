# Exercise to Lesson Migration Plan

## Overview
This document outlines the step-by-step plan to migrate all references of "Exercise" to "Lesson" in the Face Yoga Progress Tracker application. The migration will involve changes to database tables, TypeScript types, React components, and API endpoints.

## Pre-Migration Checklist
- [ ] Create a new git branch: `feature/exercise-to-lesson-migration`
- [ ] Backup the database
- [ ] Run the test suite to ensure all tests pass before migration
- [ ] Document current database state and table relationships

## Phase 1: Database Migration
### 1.1 Create New Tables
```sql
-- Create new lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    duration TEXT NOT NULL,
    target_area TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create new section_lessons table
CREATE TABLE IF NOT EXISTS section_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(section_id, lesson_id)
);

-- Create new lesson_history table
CREATE TABLE IF NOT EXISTS lesson_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 1.2 Data Migration
```sql
-- Migrate data from exercises to lessons
INSERT INTO lessons 
SELECT * FROM exercises;

-- Migrate data from section_exercises to section_lessons
INSERT INTO section_lessons (id, section_id, lesson_id, order_index, created_at)
SELECT id, section_id, exercise_id, order_index, created_at 
FROM section_exercises;

-- Migrate data from exercise_history to lesson_history
INSERT INTO lesson_history (id, user_id, lesson_id, duration, completed_at)
SELECT id, user_id, exercise_id, duration, completed_at 
FROM exercise_history;
```

### 1.3 Update Foreign Keys and References
```sql
-- Update any foreign key references in other tables
-- (Add specific ALTER TABLE statements based on database inspection)
```

### 1.4 Verify Data Migration
- [ ] Compare row counts between old and new tables
- [ ] Verify data integrity in new tables
- [ ] Test database queries with new tables

## Phase 2: Backend Code Changes
### 2.1 Update TypeScript Types and Interfaces
Files to modify:
- `src/types/database.types.ts`
- `src/types/supabase.ts`

### 2.2 Update API Functions
Files to modify:
- `src/api/courseApi.ts`
- `src/api/lessonApi.ts` (rename from exerciseApi.ts)

### 2.3 Update Store
Files to modify:
- Rename `useExerciseStore.ts` to `useLessonStore.ts`
- Update store implementation with new terminology

## Phase 3: Frontend Code Changes
### 3.1 Rename and Update Components
Files to rename and modify:
- `src/components/ExerciseCard.tsx` → `LessonCard.tsx`
- `src/components/ExerciseGrid.tsx` → `LessonGrid.tsx`
- `src/components/ExerciseList.tsx` → `LessonList.tsx`
- `src/components/ExerciseSearch.tsx` → `LessonSearch.tsx`
- `src/components/ExerciseFilter.tsx` → `LessonFilter.tsx`

### 3.2 Update Page Components
Files to modify:
- `src/pages/Exercises.tsx` → `Lessons.tsx`
- `src/pages/ExerciseDetails.tsx` → `LessonDetails.tsx`
- `src/pages/ExerciseHistory.tsx` → `LessonHistory.tsx`
- `src/pages/Admin/ExerciseManager.tsx` → `LessonManager.tsx`
- `src/pages/Admin/SectionExerciseManager.tsx` → `SectionLessonManager.tsx`

### 3.3 Update Routes
Files to modify:
- `src/App.tsx` or route configuration files
- Update all route paths from `/exercises/*` to `/lessons/*`

### 3.4 Update UI Text and Labels
- [ ] Search for all instances of "exercise" in text content
- [ ] Update navigation menu items
- [ ] Update button labels and tooltips
- [ ] Update page titles and headings

## Phase 4: Testing
### 4.1 Database Testing
- [ ] Test all database operations with new tables
- [ ] Verify data integrity after migration
- [ ] Test foreign key constraints

### 4.2 API Testing
- [ ] Test all API endpoints with new naming
- [ ] Verify response formats
- [ ] Test error handling

### 4.3 Frontend Testing
- [ ] Test all user flows
- [ ] Verify component rendering
- [ ] Test responsive design
- [ ] Cross-browser testing

### 4.4 Integration Testing
- [ ] Test complete user journeys
- [ ] Verify data flow from frontend to database
- [ ] Test authentication and authorization

## Phase 5: Deployment
### 5.1 Pre-Deployment
- [ ] Run final test suite
- [ ] Update documentation
- [ ] Create backup of production database

### 5.2 Database Migration
- [ ] Execute database migration scripts
- [ ] Verify data migration success
- [ ] Keep old tables for rollback possibility

### 5.3 Code Deployment
- [ ] Deploy new code to staging
- [ ] Verify staging environment
- [ ] Deploy to production

### 5.4 Post-Deployment
- [ ] Monitor error logs
- [ ] Verify all functionality in production
- [ ] Be prepared for rollback if needed

## Rollback Plan
1. Keep old tables and code for 1 week after successful migration
2. Prepare rollback scripts for database
3. Keep deployment artifacts for quick rollback
4. Document rollback procedures

## Timeline
- Phase 1: 2 hours
- Phase 2: 2 hours
- Phase 3: 4 hours
- Phase 4: 3 hours
- Phase 5: 2 hours
Total estimated time: 13 hours

## Notes
- This migration should be done during low-traffic hours
- All changes should be thoroughly tested in a staging environment first
- Database backup is crucial before starting the migration
- Consider implementing feature flags for gradual rollout
