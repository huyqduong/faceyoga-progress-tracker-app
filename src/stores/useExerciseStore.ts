import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Exercise = Database['public']['Tables']['exercises']['Row'];

interface ExerciseState {
  exercises: Exercise[];
  loading: boolean;
  error: Error | null;
  fetchExercises: () => Promise<void>;
  searchExercises: (query: string) => Promise<void>;
  getExerciseById: (id: string) => Promise<Exercise | null>;
}

export const useExerciseStore = create<ExerciseState>((set) => ({
  exercises: [],
  loading: false,
  error: null,

  fetchExercises: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select<'*', Exercise>();

      if (error) {
        throw error;
      }

      set({ exercises: data || [], loading: false });
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },

  searchExercises: async (query: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select<'*', Exercise>()
        .ilike('title', `%${query}%`);

      if (error) {
        throw error;
      }

      set({ exercises: data || [], loading: false });
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },

  getExerciseById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select<'*', Exercise>()
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching exercise:', error);
      return null;
    }
  },
}));
