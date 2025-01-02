export interface Lesson {
  id: string;
  title: string;
  duration: string;
  description: string;
  image_url: string;
  video_url?: string;
  difficulty: string;
  instructions: string[];
  benefits: string[];
  category: string;
  target_area: string;
  created_at: string;
  updated_at: string;
  is_premium: boolean;
}

export interface LessonHistory {
  id: string;
  lesson_id: string;
  user_id: string;
  completed_at: string;
  practice_time: number;
  course_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LessonHistoryEntry {
  id: string;
  completed_at: string;
  practice_time: number;
  lesson: {
    id: string;
    title: string;
    image_url: string;
    target_area: string;
    difficulty: string;
    description: string;
  };
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
