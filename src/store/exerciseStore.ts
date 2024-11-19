import { create } from 'zustand';
import type { Exercise } from '../lib/supabase-types';
import { exerciseApi } from '../lib/exercises';

interface ExerciseState {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  fetchExercises: () => Promise<void>;
  fetchExercisesByCategory: (category: string) => Promise<void>;
  createExercise: (exercise: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateExercise: (id: string, exercise: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
}

export const useExerciseStore = create<ExerciseState>((set) => ({
  exercises: [],
  loading: false,
  error: null,

  fetchExercises: async () => {
    set({ loading: true, error: null });
    try {
      const exercises = await exerciseApi.getExercises();
      set({ exercises, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch exercises';
      set({ error: message, loading: false });
    }
  },

  fetchExercisesByCategory: async (category: string) => {
    set({ loading: true, error: null });
    try {
      const exercises = await exerciseApi.getExercisesByCategory(category);
      set({ exercises, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch exercises';
      set({ error: message, loading: false });
    }
  },

  createExercise: async (exercise) => {
    set({ loading: true, error: null });
    try {
      const newExercise = await exerciseApi.createExercise(exercise);
      set((state) => ({
        exercises: [newExercise, ...state.exercises],
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create exercise';
      set({ error: message, loading: false });
      throw error;
    }
  },

  updateExercise: async (id, exercise) => {
    set({ loading: true, error: null });
    try {
      const updatedExercise = await exerciseApi.updateExercise(id, exercise);
      set((state) => ({
        exercises: state.exercises.map(ex =>
          ex.id === id ? updatedExercise : ex
        ),
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update exercise';
      set({ error: message, loading: false });
      throw error;
    }
  },

  deleteExercise: async (id) => {
    set({ loading: true, error: null });
    try {
      await exerciseApi.deleteExercise(id);
      set((state) => ({
        exercises: state.exercises.filter(ex => ex.id !== id),
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete exercise';
      set({ error: message, loading: false });
      throw error;
    }
  }
}));