export interface Profile {
  id: string;
  user_id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  streak: number;
  lessons_completed: number;
  practice_time: number;
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

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  target_area: string;
  description: string;
  image_url: string;
  video_url?: string;
  category: string;
  difficulty: string;
  instructions: string[];
  benefits: string[];
  is_premium: boolean;
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

export interface SectionLesson {
  id: string;
  section_id: string;
  lesson_id: string;
  order: number;
  created_at: string;
  updated_at: string;
  lesson?: Lesson;
}

export interface LessonHistory {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
  practice_time: number;
  created_at: string;
  updated_at: string;
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
