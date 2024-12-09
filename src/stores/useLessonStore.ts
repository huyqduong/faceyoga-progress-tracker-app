import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';

type Lesson = Database['public']['Tables']['lessons']['Row'];

interface LessonState {
  lessons: Lesson[];
  isLoading: boolean;
  error: string | null;
  fetchLessons: () => Promise<void>;
  searchLessons: (query: string) => Promise<void>;
  getLessonById: (id: string) => Promise<Lesson | null>;
}

export const useLessonStore = create<LessonState>((set) => ({
  lessons: [],
  isLoading: false,
  error: null,

  fetchLessons: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('lessons')
        .select<'*', Lesson>();

      if (error) throw error;

      set({ lessons: data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching lessons:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  searchLessons: async (query: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('lessons')
        .select<'*', Lesson>()
        .ilike('title', `%${query}%`);

      if (error) throw error;

      set({ lessons: data || [], isLoading: false });
    } catch (error) {
      console.error('Error searching lessons:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getLessonById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select<'*', Lesson>()
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching lesson by id:', error);
      set({ error: (error as Error).message });
      return null;
    }
  },
}));
