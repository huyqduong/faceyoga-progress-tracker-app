# Migration Plan: Exercise to Lesson Terminology Change

This document outlines the step-by-step plan to change all references of "Exercise" to "Lesson" throughout the codebase.

## Overview
The migration involves changing the terminology in:
- Database schema and migrations
- TypeScript types and interfaces
- React components and stores
- Test files
- Documentation

## Migration Steps

### 1. Database Changes

#### 1.1 Create New Migration File
Create a new migration file that will:
- Rename the `exercises` table to `lessons`
- Update all related foreign key constraints
- Update all policies and security rules
- Update any triggers or functions referencing exercises

#### 1.2 Update Existing Data
- Update any existing data to reflect new terminology
- Ensure data integrity during migration

### 2. Backend/API Changes

#### 2.1 Types and Interfaces
Files to update:
- `src/types/index.ts`: Rename `Exercise` interface to `Lesson`
- Update any related type definitions

#### 2.2 Database Client
- Update all database queries from `exercises` to `lessons`
- Update any related stored procedures or functions

### 3. Frontend Changes

#### 3.1 Store Updates
Files to update:
- `src/stores/useExerciseStore.ts` → Rename to `useLessonStore.ts`
- Update all method names and state variables
- Update all references to the store in other files

#### 3.2 Component Updates
- Update all component props and state references
- Update any UI text mentioning "exercise"
- Update route names and parameters

### 4. Test Updates

#### 4.1 Unit Tests
Files to update:
- `src/stores/__tests__/useExerciseStore.test.ts` → Rename to `useLessonStore.test.ts`
- Update all test descriptions and assertions
- Update mock data and test utilities

#### 4.2 Integration Tests
- Update any integration tests referencing exercises
- Update test fixtures and setup files

### 5. Documentation Updates
- Update README.md and other documentation files
- Update API documentation
- Update code comments

## Execution Order

1. Create backup of current database
2. Execute database migration
3. Update backend code
4. Update frontend code
5. Update tests
6. Update documentation
7. Deploy changes in staging environment
8. Test thoroughly
9. Deploy to production

## Rollback Plan

In case of issues:
1. Keep old database backup
2. Maintain copy of pre-migration codebase
3. Document rollback procedures for each step

## Testing Strategy

1. Unit Tests:
   - Ensure all renamed components and functions work as expected
   - Verify type safety and compile-time checks

2. Integration Tests:
   - Test full flow with new terminology
   - Verify database operations
   - Check API endpoints

3. Manual Testing:
   - Verify UI displays correct terminology
   - Test all user flows
   - Verify data persistence

## Post-Migration Verification

1. Database:
   - Verify all data migrated correctly
   - Check all constraints and policies
   - Verify backup procedures

2. Application:
   - Verify all features work as expected
   - Check for any remaining "exercise" references
   - Monitor error logs

3. Performance:
   - Monitor application performance
   - Check database query performance
   - Verify API response times

## Timeline Estimate

1. Planning and Setup: 1 day
2. Database Migration: 1 day
3. Code Updates: 2-3 days
4. Testing: 1-2 days
5. Documentation: 1 day
6. Deployment: 1 day

Total Estimated Time: 7-9 days
