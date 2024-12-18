# Progress Tracking Feature Documentation

## Overview
The Progress feature tracks and visualizes user progress across courses, lessons, and practice sessions. It provides insights into user engagement, completion rates, and learning patterns.

## Architecture

### Data Model
```typescript
interface Progress {
  id: string;
  user_id: string;
  lesson_id?: string;
  course_id?: string;
  practice_id?: string;
  completed: boolean;
  completion_percentage: number;
  last_activity_at: string;
  duration: number;
  created_at: string;
  updated_at: string;
}

interface PracticeSession {
  id: string;
  user_id: string;
  lesson_id?: string;
  duration: number;
  notes?: string;
  mood?: string;
  created_at: string;
}

interface ProgressStats {
  total_practice_time: number;
  total_sessions: number;
  streak_days: number;
  completed_lessons: number;
  completed_courses: number;
  average_session_duration: number;
}
```

### State Management

#### Progress Store (`src/store/progressStore.ts`)
```typescript
interface ProgressState {
  progress: Record<string, Progress>;
  stats: ProgressStats | null;
  loading: boolean;
  error: string | null;
  practiceHistory: PracticeSession[];
  streakData: StreakData;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
}
```

Key Methods:
- `updateProgress(progressData)`: Updates progress records
- `calculateStats()`: Computes user statistics
- `updateStreak()`: Updates streak information
- `logPracticeSession()`: Records new practice sessions

## Components

### ProgressDashboard (`src/components/ProgressDashboard.tsx`)
Main progress visualization component.

Features:
- Progress overview
- Statistics display
- Streak tracking
- Achievement badges

Props:
```typescript
interface ProgressDashboardProps {
  userId: string;
  timeframe?: 'week' | 'month' | 'year';
  showDetails?: boolean;
}
```

### ProgressChart (`src/components/ProgressChart.tsx`)
Visualization component for progress data.

Features:
- Practice time trends
- Completion rates
- Streak visualization
- Custom date ranges

### PracticeLogger (`src/components/PracticeLogger.tsx`)
Component for logging practice sessions.

Props:
```typescript
interface PracticeLoggerProps {
  onLog: (session: PracticeSession) => void;
  defaultDuration?: number;
  lessonId?: string;
}
```

## Progress Calculation

### Completion Rules
```typescript
const calculateCompletion = {
  lesson: (progress: number) => progress >= 0.9,
  course: (completedLessons: number, totalLessons: number) => 
    completedLessons / totalLessons >= 0.8,
  practice: (duration: number, targetDuration: number) =>
    duration >= targetDuration
};
```

### Streak Calculation
```typescript
const updateStreak = (lastPractice: Date, currentStreak: number) => {
  const today = new Date();
  const daysSinceLastPractice = getDaysDifference(today, lastPractice);
  
  if (daysSinceLastPractice <= 1) {
    return currentStreak + 1;
  }
  return 0;
};
```

## API Layer

### Progress API (`src/lib/progress.ts`)
```typescript
const progressApi = {
  fetchProgress(userId: string): Promise<Progress[]>;
  updateProgress(progressData: Partial<Progress>): Promise<Progress>;
  fetchStats(userId: string): Promise<ProgressStats>;
  logPractice(session: PracticeSession): Promise<void>;
  getStreakData(userId: string): Promise<StreakData>;
};
```

## Analytics and Insights

### Metrics Tracked
1. Time-based metrics
   - Total practice time
   - Average session duration
   - Time per exercise

2. Completion metrics
   - Lesson completion rates
   - Course progress
   - Practice consistency

3. Engagement metrics
   - Streak data
   - Session frequency
   - Preferred practice times

### Data Visualization
```typescript
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}
```

## Gamification

### Achievement System
```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  criteria: (stats: ProgressStats) => boolean;
  reward?: string;
}

const achievements: Achievement[] = [
  {
    id: 'first_completion',
    title: 'First Step',
    description: 'Complete your first lesson',
    criteria: (stats) => stats.completed_lessons > 0
  },
  // More achievements...
];
```

### Streak Rewards
- Daily streak bonuses
- Milestone achievements
- Special badges

## Error Handling

### Progress Sync
```typescript
try {
  await syncProgress(progressData);
} catch (error) {
  if (error instanceof NetworkError) {
    // Store progress locally
    await storeOfflineProgress(progressData);
  }
  // Handle other errors
}
```

### Data Recovery
- Offline progress storage
- Sync conflict resolution
- Data validation

## Performance Optimization

### Data Loading
1. Progressive loading
2. Background sync
3. Cached statistics

### Computation Optimization
```typescript
// Memoized stats calculation
const calculateStats = memoize((progress: Progress[]) => {
  // Complex calculations
  return computedStats;
}, { maxAge: 5 * 60 * 1000 }); // 5 minutes cache
```

## Integration Points

### Course Integration
- Progress updates from lesson completion
- Course completion tracking
- Section progress calculation

### Practice Integration
- Session logging
- Duration tracking
- Mood and notes recording

## Debugging

### Logging System
```typescript
// Progress update logging
[ProgressStore] Updating progress for user ${userId}
[ProgressStore] New streak: ${newStreak}
[ProgressStore] Achievement unlocked: ${achievementId}
```

### Common Issues
1. Progress Sync
   - Check network connectivity
   - Verify data consistency
   - Review sync conflicts

2. Streak Calculation
   - Timezone handling
   - Date calculations
   - Edge cases

## Recent Updates

### December 2024
1. Enhanced streak calculation
2. Added offline support
3. Improved progress visualization
4. Added achievement system
5. Enhanced analytics

### Planned Updates
1. Advanced analytics dashboard
2. Social features integration
3. Custom goal setting
4. Progress sharing
5. Enhanced gamification
