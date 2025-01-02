export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          streak?: number;
          lessons_completed?: number;
          practice_time?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          streak?: number;
          lessons_completed?: number;
          practice_time?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
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
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
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
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          duration?: string;
          description?: string;
          image_url?: string;
          video_url?: string;
          difficulty?: string;
          instructions?: string[];
          benefits?: string[];
          category?: string;
          target_area?: string;
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_lessons: {
        Row: {
          id: string;
          course_id: string;
          lesson_id: string;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          lesson_id: string;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          lesson_id?: string;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_purchases: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          amount: number;
          currency: string;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_intent_id: string;
          payment_method: string;
          receipt_url: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          amount: number;
          currency: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_intent_id: string;
          payment_method: string;
          receipt_url?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          payment_intent_id?: string;
          payment_method?: string;
          receipt_url?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_access: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          purchase_id: string;
          access_type: 'lifetime' | 'subscription' | 'trial';
          starts_at: string;
          expires_at: string | null;
          last_accessed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          purchase_id: string;
          access_type?: 'lifetime' | 'subscription' | 'trial';
          starts_at?: string;
          expires_at?: string | null;
          last_accessed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          purchase_id?: string;
          access_type?: 'lifetime' | 'subscription' | 'trial';
          starts_at?: string;
          expires_at?: string | null;
          last_accessed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      early_access_signups: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          status: 'pending' | 'notified';
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          status?: 'pending' | 'notified';
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          status?: 'pending' | 'notified';
        };
      };
      site_settings: {
        Row: {
          id: string;
          business_name: string;
          logo_url: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          description: string | null;
          contact_email: string | null;
          social_links: Record<string, string> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name?: string;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          description?: string | null;
          contact_email?: string | null;
          social_links?: Record<string, string> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          description?: string | null;
          contact_email?: string | null;
          social_links?: Record<string, string> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: string;
          business_name: string;
          logo_url: string | null;
          description: string;
          primary_color: string;
          secondary_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name?: string;
          logo_url?: string | null;
          description?: string;
          primary_color?: string;
          secondary_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          logo_url?: string | null;
          description?: string;
          primary_color?: string;
          secondary_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: []
      };
      goals: {
        Row: {
          id: string;
          label: string;
          icon: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          icon: string;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          icon?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}
