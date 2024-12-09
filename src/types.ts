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
  is_premium?: boolean;
  created_at: string;
  updated_at: string;
}
