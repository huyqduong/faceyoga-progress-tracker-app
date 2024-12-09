export interface Lesson {
  id: string;
  title: string;
  duration: string;
  description: string;
  thumbnail_url: string;
  video_url?: string | null;
  difficulty: string;
  instructions: string[];
  benefits: string[];
  category: string;
  is_premium: boolean;
  target_area: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  difficulty: string;
  category: string;
  price: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface SectionLesson {
  section_id: string;
  lesson_id: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  onboarding_completed: boolean;
  role: 'user' | 'admin';
  subscription_status: 'active' | 'inactive' | 'trialing' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  business_name: string;
  tagline: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_date: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface LessonHistory {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
  duration: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  rating: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  completed_lessons: number;
  total_lessons: number;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'inactive' | 'trialing' | 'cancelled';
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export type AccessFilter = 'all' | 'free' | 'premium';
