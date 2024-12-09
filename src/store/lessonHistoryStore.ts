import { create } from 'zustand';
import { lessonApi } from '../lib/lessons';
import type { LessonHistory } from '../types';

interface LessonHistoryState {
  history: LessonHistory[];
  loading: boolean;
  error: string | null;
  fetchHistory: (userId: string) => Promise<void>;
}

export const useLessonHistoryStore = create<LessonHistoryState>((set) => ({
  history: [],
  loading: false,
  error: null,

  fetchHistory: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const history = await lessonApi.getLessonHistory(userId);
      set({ history, loading: false });
    } catch (error) {
      console.error('Error fetching lesson history:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch lesson history',
        loading: false 
      });
    }
  }
}));
