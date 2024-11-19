import { create } from 'zustand';
import { exerciseApi } from '../lib/exercises';
import type { Exercise } from '../lib/supabase-types';

interface ExerciseHistoryEntry {
  exercise_id: string;
  completed_at: string;
  duration: number;
  exercise: Exercise;
}

interface ExerciseHistoryState {
  history: ExerciseHistoryEntry[];
  loading: boolean;
  error: string | null;
  fetchHistory: (userId: string) => Promise<void>;
}

export const useExerciseHistoryStore = create<ExerciseHistoryState>((set) => ({
  history: [],
  loading: false,
  error: null,

  fetchHistory: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const history = await exerciseApi.getExerciseHistory(userId);
      set({ history, loading: false });
    } catch (error) {
      console.error('Error fetching exercise history:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch exercise history',
        loading: false 
      });
    }
  },
}));