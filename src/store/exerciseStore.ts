import { create } from 'zustand';
import type { Exercise } from '../lib/supabase-types';
import { exerciseApi } from '../lib/exercises';

interface ExerciseState {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  fetchExercises: () => Promise<void>;
  fetchExercisesByCategory: (category: string) => Promise<void>;
  createExercise: (exercise: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateExercise: (id: string, exercise: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,

  reset: () => {
    set({ exercises: [], loading: false, error: null, page: 1, hasMore: true });
  },

  fetchExercises: async () => {
    const { page } = get();
    set({ loading: true, error: null });
    try {
      const exercises = await exerciseApi.getExercises(page);
      set(state => ({ 
        exercises: page === 1 ? exercises : [...state.exercises, ...exercises],
        loading: false,
        hasMore: exercises.length > 0
      }));
    } catch (error) {
      console.error('Error fetching exercises:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch exercises', loading: false });
    }
  },

  loadMore: async () => {
    const { loading, hasMore } = get();
    if (loading || !hasMore) return;

    set(state => ({ page: state.page + 1 }));
    await get().fetchExercises();
  },

  fetchExercisesByCategory: async (category: string) => {
    set({ loading: true, error: null, page: 1 });
    try {
      const exercises = await exerciseApi.getExercisesByCategory(category);
      set({ exercises, loading: false, hasMore: exercises.length > 0 });
    } catch (error) {
      console.error('Error fetching exercises by category:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch exercises', loading: false });
    }
  },

  createExercise: async (exercise) => {
    set({ loading: true, error: null });
    try {
      const newExercise = await exerciseApi.createExercise(exercise);
      if (!newExercise) throw new Error('Failed to create exercise');
      
      set(state => ({
        exercises: [newExercise, ...state.exercises],
        loading: false
      }));
    } catch (error) {
      console.error('Error creating exercise:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create exercise', loading: false });
      throw error;
    }
  },

  updateExercise: async (id, exercise) => {
    set({ loading: true, error: null });
    try {
      const updatedExercise = await exerciseApi.updateExercise(id, exercise);
      set(state => ({
        exercises: state.exercises.map(ex => ex.id === id ? updatedExercise : ex),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating exercise:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update exercise', loading: false });
      throw error;
    }
  },

  deleteExercise: async (id) => {
    set({ loading: true, error: null });
    try {
      await exerciseApi.deleteExercise(id);
      set(state => ({
        exercises: state.exercises.filter(ex => ex.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting exercise:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete exercise', loading: false });
      throw error;
    }
  }
}));