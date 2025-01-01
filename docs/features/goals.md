# Goals Feature Documentation

## Overview
The Goals feature allows users to set, track, and achieve face yoga practice goals. It includes milestone tracking, progress visualization, and integration with lessons and exercises.

## Features

### Goal Management
- Set personal face yoga goals
- Track progress through milestones
- View goal completion status
- Set goal difficulty levels
- Configure reminder frequency
- Set priority levels for goals

### Goal Progress Tracking
- Visual progress indicators
- Milestone achievement tracking
- Progress history
- Status updates (Not Started, In Progress, Completed, Paused)
- Notes and documentation

### Goal Analytics
- Completion rates
- Average progress
- Time spent tracking
- Milestone achievements
- Points and rewards system

## Implementation

### Data Model

#### Goal
```typescript
interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: string;
  points_reward: number;
  created_at: string;
}
```

#### User Goal
```typescript
interface UserGoal {
  id: string;
  user_id: string;
  goal_id: string;
  priority: number;
  start_date: string;
  target_date: string | null;
  reminder_frequency: 'daily' | 'weekly' | 'monthly' | 'none';
}
```

#### Goal Progress
```typescript
interface GoalProgress {
  id: string;
  user_id: string;
  goal_id: string;
  progress_value: number;
  milestone_reached: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  notes: string | null;
  last_updated: string;
  created_at: string;
}
```

#### Goal Milestone
```typescript
interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  target_value: number;
  reward_points: number;
  created_at: string;
}
```

### Key Components

#### GoalProgressCard
- Circular progress visualization
- Status indicators with color coding
- Milestone progress tracking
- Related lessons integration
- Quick status updates

#### GoalMilestones
- Milestone listing and tracking
- Progress visualization
- Reward points display
- Achievement tracking

### State Management

The goals feature uses Zustand for state management with the following operations:

#### Progress Tracking
- `fetchGoalProgress`: Retrieve goal progress for a user
- `fetchGoalMilestones`: Get milestones for a specific goal
- `updateGoalProgress`: Update progress for a goal
- `updateGoalStatus`: Change goal status
- `trackLessonCompletion`: Track progress from completed lessons

#### Analytics
- `getGoalAnalytics`: Calculate goal-specific analytics
  - Completion rate
  - Average progress
  - Time spent

### Integration Features

#### Lesson Integration
- Track goal progress through lesson completion
- Map exercises to goals
- Weight-based progress calculation
- Automatic progress updates

#### Exercise Mapping
```typescript
interface ExerciseGoalMapping {
  id: string;
  exercise_id: string;
  goal_id: string;
  contribution_weight: number;
  created_at: string;
}
```

### Status Management

#### Status Types
- Not Started: Goal is created but no progress
- In Progress: Active goal with ongoing progress
- Completed: All milestones achieved
- Paused: Temporarily suspended progress

#### Status Visualization
```typescript
const statusColors = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-mint-100 text-mint-600',
  completed: 'bg-green-100 text-green-600',
  paused: 'bg-yellow-100 text-yellow-600'
};
```

## Usage

### Setting Goals
1. Navigate to Goals page
2. View available goals
3. Select goal difficulty and category
4. Set priority and reminders
5. Track progress through milestones

### Tracking Progress
1. Complete related lessons
2. View progress in circular indicator
3. Track milestone achievements
4. Update goal status as needed
5. Add progress notes

### Managing Goals
1. View all active goals
2. Update goal status
3. Check milestone progress
4. View related lessons
5. Track reward points

## Technical Notes

### Dependencies
- react-circular-progressbar: Progress visualization
- date-fns: Date handling
- Supabase: Backend storage
- Zustand: State management

### Performance Considerations
- Parallel data fetching
- Optimized progress calculations
- Efficient milestone tracking
- Responsive UI updates

### Security
- User-specific goal tracking
- Secure progress storage
- Protected milestone data
- Access control through Supabase RLS
