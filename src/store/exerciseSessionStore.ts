import { create } from 'zustand';
import type { Exercise } from '../lib/supabase-types';

interface ExerciseSessionState {
  currentExercise: Exercise | null;
  isActive: boolean;
  startExercise: (exercise: Exercise) => void;
  endExercise: () => void;
}

export const useExerciseSessionStore = create<ExerciseSessionState>((set) => ({
  currentExercise: null,
  isActive: false,

  startExercise: (exercise) => {
    set({ currentExercise: exercise, isActive: true });
  },

  endExercise: () => {
    set({ currentExercise: null, isActive: false });
  },
}));