import { supabase, supabaseApi } from './supabase';
import type { Exercise } from './supabase-types';

const DEFAULT_PAGE_SIZE = 50;

export const exerciseApi = {
  async getExercises(page = 1): Promise<Exercise[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE - 1);

      if (error) {
        console.error('Error fetching exercises:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }
  },

  async getExercisesByCategory(category: string, page = 1): Promise<Exercise[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .range((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE - 1);

      if (error) {
        console.error('Error fetching exercises by category:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching exercises by category:', error);
      return [];
    }
  },

  async createExercise(exercise: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>): Promise<Exercise | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated user');

      const transformedExercise = {
        ...exercise,
        instructions: exercise.instructions || [],
        benefits: exercise.benefits || [],
        video_url: exercise.video_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('exercises')
        .insert(transformedExercise)
        .select()
        .single();

      if (error) {
        console.error('Error creating exercise:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
  },

  async updateExercise(id: string, exercise: Partial<Exercise>): Promise<Exercise> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated user');

      const transformedExercise = {
        ...exercise,
        instructions: exercise.instructions || [],
        benefits: exercise.benefits || [],
        video_url: exercise.video_url || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('exercises')
        .update(transformedExercise)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  },

  async deleteExercise(id: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  },

  async completeExercise(userId: string, exerciseId: string, duration: number): Promise<void> {
    try {
      const { error } = await supabase.rpc('complete_exercise', {
        user_id: userId,
        exercise_id: exerciseId,
        duration_minutes: duration
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error completing exercise:', error);
      throw error;
    }
  },

  async getExerciseHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('exercise_history')
        .select('*, exercise:exercises(*)')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching exercise history:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching exercise history:', error);
      return [];
    }
  }
};