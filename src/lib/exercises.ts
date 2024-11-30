import { supabase } from './supabase';
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
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          ...exercise,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating exercise:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error creating exercise:', error);
      return null;
    }
  },

  async updateExercise(id: string, exercise: Partial<Exercise>): Promise<Exercise> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('update_exercise', {
          exercise_id: id,
          exercise_data: {
            title: exercise.title,
            duration: exercise.duration,
            target_area: exercise.target_area,
            description: exercise.description,
            image_url: exercise.image_url,
            video_url: exercise.video_url,
            category: exercise.category,
            difficulty: exercise.difficulty,
            instructions: exercise.instructions,
            benefits: exercise.benefits
          },
          auth_uid: user.id
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  },

  async deleteExercise(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw new Error('Failed to delete exercise');
    }
  },

  async completeExercise(userId: string, exerciseId: string, duration: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('exercise_history')
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          duration: duration,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error completing exercise:', error);
      throw new Error('Failed to complete exercise');
    }
  },

  async getExerciseHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('exercise_history')
        .select(`
          id,
          exercise_id,
          completed_at,
          duration,
          exercises (
            id,
            title,
            duration,
            target_area,
            description,
            image_url,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching exercise history:', error);
      throw new Error('Failed to fetch exercise history');
    }
  }
};