# Course Management

The Course Management feature allows administrators to create, edit, and delete yoga courses. Each course consists of multiple sections, and each section contains multiple lessons.

## Components

### CourseManager (`src/pages/Admin/CourseManager.tsx`)

The main component that handles the course management interface. It provides:
- A grid view of all available courses
- Ability to create new courses
- Loading states and error handling
- Mobile-responsive layout

Key features:
- Responsive grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
- Loading skeleton placeholders
- Error message display
- Empty state with illustration

### CourseCard (`src/components/CourseCard.tsx`)

A card component that displays course information. Features:
- Course image with placeholder for missing images
- Difficulty badge overlay
- Course title and description
- Section and lesson counts
- Course duration
- Hover actions (edit and delete)
- Loading state overlay

### CourseForm (`src/components/CourseForm.tsx`)

Form component for creating and editing courses. Includes:
- Course title and description fields
- Image upload functionality
- Section management
- Lesson selection for each section
- Form validation
- Loading states during submission

## State Management

### CourseStore (`src/store/courseStore.ts`)

Manages the global state for courses using Zustand. Key functionalities:

```typescript
interface CourseState {
  courses: Course[];
  sections: Record<string, CourseSection[]>;
  lessons: Record<string, SectionLesson[]>;
  loading: boolean;
  loadingCourseIds: string[];
  error: string | null;
  
  // Actions
  fetchCourses: () => Promise<void>;
  fetchAllCourses: () => Promise<void>;
  fetchCourseSections: (courseId: string) => Promise<CourseSection[]>;
  fetchSectionLessons: (sectionId: string) => Promise<SectionLesson[]>;
  createCourse: (data: CreateCourseData) => Promise<Course>;
  updateCourse: (courseId: string, courseData: Partial<Course>) => Promise<Course>;
  deleteCourse: (id: string) => Promise<void>;
  clearError: () => void;
  isLoadingCourse: (courseId: string) => boolean;
}
```

## Data Models

### Course
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  image_url?: string;
  welcome_video?: string;
}
```

### CourseSection
```typescript
interface CourseSection {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: string[]; // Array of lesson IDs
}
```

### SectionLesson
```typescript
interface SectionLesson {
  id: string;
  lesson_id: string;
  order_id: number;
  lessons: {
    id: string;
    title: string;
    description: string;
    duration: string;
    difficulty: string;
    image_url?: string;
    video_url?: string;
    instructions?: string;
    benefits?: string;
    category?: string;
    target_area?: string;
  };
}
```

## UI/UX Considerations

1. **Loading States**
   - Skeleton placeholders during initial load
   - Loading overlay on individual cards during operations
   - Disabled interactions during loading

2. **Error Handling**
   - Clear error messages with visual indicators
   - Confirmation dialogs for destructive actions
   - Toast notifications for operation results

3. **Responsive Design**
   - Grid layout adapts to screen size
   - Mobile-friendly touch targets
   - Optimized image loading

4. **Visual Feedback**
   - Hover effects on cards and buttons
   - Transition animations
   - Clear action indicators

## Database Schema (Supabase)

### courses
- id: uuid (primary key)
- title: text
- description: text
- difficulty: text
- duration: text
- image_url: text (optional)
- welcome_video: text (optional)

### course_sections
- id: uuid (primary key)
- course_id: uuid (foreign key -> courses.id)
- title: text
- description: text
- order_index: integer

### section_lessons
- id: uuid (primary key)
- section_id: uuid (foreign key -> course_sections.id)
- lesson_id: uuid (foreign key -> lessons.id)
- order_id: integer

## Future Improvements

1. **Performance**
   - Implement pagination for large course lists
   - Add caching for frequently accessed courses
   - Optimize image loading with lazy loading

2. **Features**
   - Course preview mode
   - Bulk course actions
   - Course analytics and insights
   - Course duplication
   - Course templates

3. **UI/UX**
   - Advanced filtering and sorting options
   - Drag-and-drop section reordering
   - Rich text editor for descriptions
   - Advanced image management

4. **Data Management**
   - Course versioning
   - Course archiving
   - Course access control
   - Course scheduling
