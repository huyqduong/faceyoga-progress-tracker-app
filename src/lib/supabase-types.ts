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
  welcome_video?: string;
  difficulty: string;
  duration: string;
  price: number;
  currency: string;
  is_published: boolean;
  access_type: 'lifetime' | 'subscription' | 'trial';
  trial_duration_days: number;
  subscription_duration_months: number;
  rating: number;
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

export interface CoursePurchase {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_intent_id: string;
  payment_method: string;
  receipt_url?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  course?: Course;
}

export interface CourseAccess {
  id: string;
  user_id: string;
  course_id: string;
  purchase_id: string;
  access_type: 'lifetime' | 'subscription' | 'trial';
  starts_at: string;
  expires_at?: string;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
  course?: Course;
  purchase?: CoursePurchase;
}
