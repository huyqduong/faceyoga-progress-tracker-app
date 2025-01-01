import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface LessonHistory {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
  practice_time: number;
  created_at: string;
  updated_at: string;
}

interface LessonHistoryStore {
  history: LessonHistory[];
  fetchHistory: () => Promise<void>;
}

export const useLessonHistoryStore = create<LessonHistoryStore>((set) => ({
  history: [],
  fetchHistory: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        console.error('No user found when fetching history');
        return;
      }

      const { data, error } = await supabase
        .from('lesson_history')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      set({ history: data || [] });
    } catch (error) {
      console.error('Error fetching lesson history:', error);
      throw error;
    }
  },
}));
