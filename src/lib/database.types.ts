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
          exercises_done: number;
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
          exercises_done?: number;
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
          exercises_done?: number;
          practice_time?: number;
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
    };
  };
}