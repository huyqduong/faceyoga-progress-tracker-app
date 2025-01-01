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

## Course Management System

The course management system organizes face yoga lessons into structured learning paths, helping users progress systematically through their face yoga journey.

### Features

#### Course Structure
- Hierarchical organization of lessons
- Progressive difficulty levels
- Clear prerequisites and requirements
- Course completion tracking
- Estimated time commitments

#### Course Types
1. **Beginner Courses**
   - Introduction to face yoga
   - Basic techniques and movements
   - Proper form and safety guidelines

2. **Intermediate Courses**
   - Advanced techniques
   - Targeted area exercises
   - Combination movements

3. **Specialized Programs**
   - Area-specific routines
   - Intensive programs
   - Maintenance routines

#### Progress Tracking
- Course completion percentage
- Individual lesson progress
- Time spent per course
- Achievement tracking
- Streak maintenance

#### User Experience
- Intuitive course navigation
- Clear progress indicators
- Mobile-responsive design
- Offline access to course content
- Resume from last position

## Technical Implementation

### Course Data Structure
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessons: Lesson[];
  prerequisites?: string[];
  estimatedDuration: number;
  thumbnail?: string;
}

interface CourseProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  startedAt: string;
  lastAccessedAt: string;
  completedAt?: string;
}
```

### Course Access Control
- User role-based access
- Premium content restrictions
- Trial access management
- Course availability scheduling

### Error Handling
- Invalid course access
- Progress sync failures
- Content loading issues
- Network connectivity problems

## Usage Examples

### Accessing Course Progress
```typescript
const getCourseProgress = async (courseId: string) => {
  try {
    const progress = await courseStore.getCourseProgress(courseId);
    return {
      completedLessons: progress.completedLessons,
      percentComplete: calculateProgress(progress),
      remainingLessons: getRemainingLessons(progress)
    };
  } catch (error) {
    toast.error('Failed to load course progress');
    return null;
  }
};
```

## Best Practices

### Course Creation
1. Clear learning objectives
2. Logical progression of difficulty
3. Consistent lesson structure
4. Regular assessment points
5. Clear prerequisite information

### Content Organization
1. Modular lesson structure
2. Progressive skill building
3. Regular review points
4. Clear success criteria
5. Flexible learning paths

## Related Documentation
- [Lesson System](./lessons.md)
- [Progress Tracking](./progress.md)
- [User Profiles](./profile.md)

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
