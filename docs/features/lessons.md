# Lessons Feature Documentation

## Overview
The Lessons feature is a fundamental component of the Face Yoga Progress Tracker app that manages individual yoga lessons, their content, and their relationships with courses. Lessons can exist independently or as part of course sections.

## Architecture

### Data Model
```typescript
interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  category: string;
  video_url?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface SectionLesson {
  id: string;
  section_id: string;
  lesson_id: string;
  order_id: number;
  lesson: Lesson;
}

interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  last_watched_at: string;
  watch_duration: number;
  created_at: string;
  updated_at: string;
}
```

### State Management

#### Lesson Store (`src/store/lessonStore.ts`)
Primary state manager for lessons with the following features:
- Lesson data caching
- Pagination support
- Category-based filtering
- Progress tracking

```typescript
interface LessonState {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  categories: string[];
  lessonsLoaded: boolean;
}
```

Key Methods:
- `ensureLessonsLoaded()`: Ensures lessons are loaded before access
- `getLessonById(id)`: Retrieves a specific lesson
- `getLessonsByIds(ids)`: Batch retrieves lessons
- `fetchLessons()`: Loads lessons with pagination
- `fetchLessonsByCategory(category)`: Category-filtered loading

## Components

### LessonManager (`src/pages/Admin/LessonManager.tsx`)
Admin interface for lesson management.

Features:
- Lesson creation and editing
- Category management
- Bulk operations
- Search and filtering

### LessonPlayer (`src/components/LessonPlayer.tsx`)
Video player component for lesson content.

Props:
```typescript
interface LessonPlayerProps {
  lesson: Lesson;
  onProgress: (progress: number) => void;
  onComplete: () => void;
  autoPlay?: boolean;
}
```

Features:
- Video playback controls
- Progress tracking
- Completion reporting
- Error handling

### LessonForm (`src/components/LessonForm.tsx`)
Form component for lesson creation and editing.

Props:
```typescript
interface LessonFormProps {
  initialData?: Lesson;
  onSubmit: (data: LessonFormData) => void;
  onCancel: () => void;
}
```

### LessonCard (`src/components/LessonCard.tsx`)
Card component for displaying lesson information.

Props:
```typescript
interface LessonCardProps {
  lesson: Lesson;
  progress?: LessonProgress;
  onClick?: () => void;
  showProgress?: boolean;
}
```

## API Layer

### Lesson API (`src/lib/lessons.ts`)
Handles all lesson-related API calls to Supabase.

Key Methods:
```typescript
const lessonApi = {
  fetchLessons(): Promise<Lesson[]>;
  fetchLessonsByCategory(category: string): Promise<Lesson[]>;
  createLesson(data: CreateLessonData): Promise<Lesson>;
  updateLesson(id: string, data: UpdateLessonData): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;
  updateProgress(userId: string, lessonId: string, progress: number): Promise<void>;
}
```

## Progress Tracking

### Implementation
Progress tracking is implemented through:
1. Video player progress events
2. Backend progress storage
3. Real-time progress updates

```typescript
// Progress update flow
onProgress = async (progress: number) => {
  if (progress >= 0.9) {
    await markLessonComplete();
  }
  await updateProgress(progress);
};
```

### Progress States
- Not Started: No progress record
- In Progress: 0 < progress < 100
- Completed: progress >= 90%

## Error Handling

### Video Playback
```typescript
try {
  await videoPlayer.play();
} catch (error) {
  if (error instanceof NotAllowedError) {
    // Handle autoplay restrictions
  } else {
    // Handle other playback errors
  }
}
```

### Data Loading
- Network error recovery
- Invalid data handling
- Loading state management

## Performance Optimization

### Lesson Loading
1. **Lazy Loading**
   - Load lessons on demand
   - Implement pagination
   - Cache loaded lessons

2. **Preloading**
   ```typescript
   // Preload next lesson in sequence
   const preloadNextLesson = async (currentIndex: number) => {
     const nextLesson = lessons[currentIndex + 1];
     if (nextLesson) {
       await prefetchVideo(nextLesson.video_url);
     }
   };
   ```

### Video Optimization
1. Adaptive bitrate streaming
2. Quality selection
3. Bandwidth management

## Integration with Courses

### Lesson Assignment
1. Lessons can be assigned to multiple course sections
2. Order is maintained per section
3. Progress is tracked independently

### Access Control
```typescript
const hasAccess = async (userId: string, lessonId: string) => {
  // Check direct access
  if (await hasDirectAccess(userId, lessonId)) return true;
  
  // Check course-based access
  return await hasCourseAccess(userId, lessonId);
};
```

## Debugging

### Logging
```typescript
// Example log entries
[LessonStore] Starting ensureLessonsLoaded
[LessonStore] Loading lessons...
[LessonStore] Successfully loaded ${count} lessons
```

### Common Issues
1. Video Playback
   - Check video URL validity
   - Verify CORS settings
   - Check browser compatibility

2. Progress Tracking
   - Verify user authentication
   - Check progress update calls
   - Validate progress data

## Recent Updates

### December 2024
1. Implemented lesson caching
2. Added progress tracking
3. Enhanced video player controls
4. Improved error handling
5. Added debug logging

### Planned Updates
1. Offline lesson support
2. Enhanced video analytics
3. Batch progress updates
4. Performance monitoring
5. Advanced caching strategies