export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      lessons: {
        Row: {
          id: string
          title: string
          duration: string
          target_area: string
          description: string
          image_url: string
          difficulty: string
          instructions: string[]
          benefits: string[]
          category: string
          created_at: string
          updated_at: string
          is_premium: boolean
          video_url?: string
        }
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['lessons']['Row']>
      }
      course_lessons: {
        Row: {
          id: string
          course_id: string
          lesson_id: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['course_lessons']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['course_lessons']['Row']>
      }
      course_purchases: {
        Row: {
          id: string
          user_id: string
          course_id: string
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_intent_id: string
          payment_method: string
          receipt_url: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['course_purchases']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['course_purchases']['Row']>
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription: {
            status: string
            expires_at: string
          }
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_subscriptions']['Row']>
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          streak: number
          lessons_completed: number
          practice_time: number
          experience_level: 'beginner' | 'intermediate' | 'advanced' | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      progress: {
        Row: {
          id: string
          user_id: string
          image_url: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['progress']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['progress']['Row']>
      }
      early_access_signups: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['early_access_signups']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['early_access_signups']['Row']>
      }
      lesson_history: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed_at: string
          practice_time: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['lesson_history']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['lesson_history']['Row']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
