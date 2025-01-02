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
      exercises: {
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
          is_premium?: boolean
        }
        Insert: Omit<Database['public']['Tables']['exercises']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['exercises']['Row']>
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
          exercises_done: number
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
