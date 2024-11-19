export interface Profile {
  id: string;
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  address?: string;
  phone?: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  streak: number;
  exercises_done: number;
  practice_time: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserGoals {
  id: string;
  user_id: string;
  goals: string[];
  time_commitment: number;
  concerns: string;
  ai_recommendation: string;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  title: string;
  duration: string;
  target_area: string;
  description: string;
  image_url: string;
  video_url?: string;
  category: string;
  difficulty: string;
  instructions?: string[];
  benefits?: string[];
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  difficulty: string;
  duration: string;
  created_at: string;
  updated_at: string;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface SectionExercise {
  id: string;
  section_id: string;
  exercise_id: string;
  order_index: number;
  created_at: string;
  exercise?: Exercise;
}

export interface Progress {
  id: string;
  user_id: string;
  image_url: string;
  notes: string;
  created_at: string;
}