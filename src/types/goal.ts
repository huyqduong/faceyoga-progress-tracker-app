import { Database } from './supabase';

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'paused';
export type GoalDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'none';

export interface Goal extends Database['public']['Tables']['goals']['Row'] {
  category: string | null;
  difficulty: GoalDifficulty | null;
  estimated_duration: string | null;
  points_reward: number;
}

export interface UserGoal extends Database['public']['Tables']['user_goals']['Row'] {
  priority: number;
  start_date: string;
  target_date: string | null;
  reminder_frequency: ReminderFrequency;
  goal?: Goal;
}

export interface GoalProgress {
  id: string;
  user_id: string;
  goal_id: string;
  progress_value: number;
  milestone_reached: number;
  last_updated: string;
  created_at: string;
  notes: string | null;
  status: GoalStatus;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  target_value: number;
  reward_points: number;
  created_at: string;
}

export interface LessonGoalMapping {
  id: string;
  lesson_id: string;
  goal_id: string;
  contribution_weight: number;
  created_at: string;
}

export interface GoalWithProgress extends Goal {
  progress?: GoalProgress;
  milestones?: GoalMilestone[];
  lessons?: Array<{
    lesson_id: string;
    contribution_weight: number;
  }>;
}
