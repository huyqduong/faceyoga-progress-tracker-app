# Courses Feature Documentation

## Overview
The Courses feature is a core component of the Face Yoga Progress Tracker app that manages the creation, display, and interaction with course content. It consists of two main views: the Course Manager (admin view) and Course Details (user view).

## Architecture

### Data Model
```typescript
// Core Types
interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  image_url?: string;
  welcome_video?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
}

interface SectionLesson {
  id: string;
  section_id: string;
  lesson_id: string;
  order_id: number;
  lesson: Lesson;
}
```

### State Management
The course data is managed through Zustand stores:

#### Course Store (`src/store/courseStore.ts`)
- Manages courses, sections, and section lessons
- Handles loading states and error handling
- Provides methods for CRUD operations

Key Features:
- Course fetching and caching
- Section management
- Lesson association with sections
- Loading state tracking per course

#### Lesson Store (`src/store/lessonStore.ts`)
- Manages individual lessons
- Handles lesson loading and caching
- Provides lesson lookup functionality

## Components

### Course Manager (`src/pages/Admin/CourseManager.tsx`)
Admin interface for managing courses.

Features:
- Course listing
- Course creation
- Course editing
- Course deletion
- Section management

### Course Details (`src/pages/CourseDetails.tsx`)
User-facing view for course content.

Features:
- Course information display
- Section and lesson navigation
- Progress tracking
- Access control
- Video content playback

### Supporting Components

#### CourseForm (`src/components/CourseForm.tsx`)
Form component for creating and editing courses.

Props:
- `initialData?: Course` - Optional course data for editing
- `onSubmit: (data: CourseFormData) => void` - Submit handler
- `onCancel: () => void` - Cancel handler

#### CourseCard (`src/components/CourseCard.tsx`)
Card component for displaying course information.

Props:
- `course: Course` - Course data to display
- `onEdit?: () => void` - Optional edit handler
- `onDelete?: () => void` - Optional delete handler

## API Layer

### Course API (`src/lib/courses.ts`)
Handles all course-related API calls to Supabase.

Key Methods:
- `fetchCourses()`: Retrieves all published courses
- `fetchCourseSections(courseId)`: Gets sections for a specific course
- `fetchSectionLessons(sectionId)`: Gets lessons for a section
- `createCourse(data)`: Creates a new course
- `updateCourse(id, data)`: Updates an existing course
- `deleteCourse(id)`: Deletes a course

## State Flow

1. Course Loading:
   ```mermaid
   graph TD
   A[User visits page] --> B[Check if courses loaded]
   B -- No --> C[Fetch courses]
   C --> D[Update store]
   D --> E[Render UI]
   B -- Yes --> E
   ```

2. Section Loading:
   ```mermaid
   graph TD
   A[Select course] --> B[Check if sections loaded]
   B -- No --> C[Fetch sections]
   C --> D[Update store]
   D --> E[Render sections]
   B -- Yes --> E
   ```

3. Lesson Loading:
   ```mermaid
   graph TD
   A[View section] --> B[Check if lessons loaded]
   B -- No --> C[Fetch section lessons]
   C --> D[Update store]
   D --> E[Render lessons]
   B -- Yes --> E
   ```

## Access Control

Courses can have different access levels:
1. Public - Available to all users
2. Premium - Requires purchase
3. Admin - Only accessible to administrators

Access is managed through:
- `hasAccessToCourse(userId, courseId)`
- `hasAccessToLesson(userId, lessonId)`

## Error Handling

The feature implements comprehensive error handling:
1. Network errors during data fetching
2. Invalid data handling
3. Access control violations
4. Loading state management

## Debugging and Monitoring

### Logging System
The course feature implements a comprehensive logging system using the `logger.ts` utility:

```typescript
// Example log entries
[CourseStore] Starting fetchCourseSections for course ${courseId}
[CourseStore] Successfully fetched ${sections.length} sections
[CourseDetails] Fetching lessons for section ${section.id}
```

Key logging areas:
1. Course loading operations
2. Section and lesson fetching
3. State updates
4. Error conditions

### Debug Panel
A `DebugPanel` component is available for real-time monitoring:
- Displays logs in real-time
- Allows filtering by log level
- Provides export functionality for log analysis
- Helps track state changes and async operations

## Race Condition Handling

### Prevention Strategies
1. **Loading State Tracking**
   ```typescript
   // Track loading state per course
   loadingCourseIds: string[]
   
   // Check before starting new request
   if (loadingCourseIds.includes(courseId)) {
     return existingData;
   }
   ```

2. **Request Deduplication**
   - Track active requests
   - Prevent duplicate section/lesson loading
   - Cancel stale requests when appropriate

3. **State Updates**
   - Atomic updates to prevent partial state
   - Proper cleanup of loading states
   - Error state management

### Recent Fixes

#### CourseDetails Component
Recent improvements to prevent race conditions:
```typescript
// Check if data needs loading
if (!sections[courseId] || sections[courseId].length === 0) {
  await fetchCourseSections(courseId);
}

// Only fetch lessons for sections that need them
const sectionsNeedingLessons = currentSections.filter(
  section => !sectionLessons[section.id] || sectionLessons[section.id].length === 0
);
```

Key improvements:
1. Proper dependency tracking in useEffect
2. Conditional data fetching
3. Better error handling
4. Loading state management per section

## State Management Details

### Course Store
The course store implements a sophisticated state management system:

```typescript
interface CourseState {
  courses: Course[];
  sections: Record<string, CourseSection[]>;
  sectionLessons: Record<string, SectionLesson[]>;
  loading: boolean;
  loadingCourseIds: string[];
  error: string | null;
}
```

State update patterns:
1. **Atomic Updates**
   ```typescript
   set(state => ({
     sections: { ...state.sections, [courseId]: sections },
     loadingCourseIds: state.loadingCourseIds.filter(id => id !== courseId)
   }));
   ```

2. **Error Handling**
   ```typescript
   catch (error) {
     set({ 
       error: error instanceof Error ? error.message : 'Unknown error',
       loading: false 
     });
   }
   ```

3. **Loading State**
   ```typescript
   // Track loading state per entity
   setLoadingSections(sectionsNeedingLessons.map(s => s.id));
   // Clear loading state after operation
   setLoadingSections(prev => prev.filter(id => id !== section.id));
   ```

## Common Tasks

### Adding a New Course
1. Navigate to Course Manager
2. Click "Add Course"
3. Fill in course details
4. Add sections and lessons
5. Save course

### Editing a Course
1. Find course in Course Manager
2. Click edit button
3. Modify course details
4. Update sections/lessons
5. Save changes

### Managing Course Access
1. Set course access level
2. Configure purchase requirements
3. Test access control

## Troubleshooting

Common issues and solutions:

1. Course not displaying:
   - Check if course is published
   - Verify user has access
   - Check network requests

2. Sections not loading:
   - Check section data in Supabase
   - Verify course ID is correct
   - Check loading states

3. Lesson playback issues:
   - Verify video URL is valid
   - Check user access permissions
   - Confirm network connectivity

## Future Improvements

Planned enhancements:
1. Bulk course operations
2. Advanced course analytics
3. Enhanced progress tracking
4. Offline course access
5. Course sharing capabilities

## Recent Updates Log

### December 2024
1. Fixed race conditions in CourseDetails component
2. Implemented comprehensive logging system
3. Added DebugPanel for real-time monitoring
4. Improved state management in course store
5. Enhanced error handling and recovery

### Planned Updates
1. Implement request cancellation for stale requests
2. Add more granular loading states
3. Enhance debugging tools
4. Improve error recovery mechanisms
5. Add performance monitoring
