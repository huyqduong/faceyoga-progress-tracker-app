import { supabase } from './supabase';
import type { Lesson, LessonHistory } from '../types';

export const lessonApi = {
  getLessons: async (page = 1, limit = 50) => {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          description,
          duration,
          difficulty,
          image_url,
          video_url,
          category,
          target_area,
          instructions,
          benefits,
          created_at,
          updated_at
        `)
        .range(start, end)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lesson[];
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  },

  getLessonsByCategory: async (category: string, page = 1, limit = 50) => {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          description,
          duration,
          difficulty,
          image_url,
          video_url,
          category,
          target_area,
          instructions,
          benefits,
          created_at,
          updated_at
        `)
        .eq('target_area', category)
        .range(start, end)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lesson[];
    } catch (error) {
      console.error('Error fetching lessons by category:', error);
      throw error;
    }
  },

  getLessonHistory: async (userId: string): Promise<LessonHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('lesson_history')
        .select(`
          id,
          lesson_id,
          completed_at,
          practice_time,
          created_at,
          updated_at
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching lesson history:', error);
      throw error;
    }
  },

  createLesson: async (lessonData: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert([lessonData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  },

  updateLesson: async (id: string, lessonData: Partial<Lesson>) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .update({
          title: lessonData.title,
          description: lessonData.description,
          duration: lessonData.duration,
          difficulty: lessonData.difficulty,
          image_url: lessonData.image_url,
          video_url: lessonData.video_url,
          category: lessonData.category,
          target_area: lessonData.target_area,
          instructions: lessonData.instructions,
          benefits: lessonData.benefits,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  },

  deleteLesson: async (id: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  },

  createLessonHistory: async (historyData: Partial<LessonHistory>) => {
    try {
      const { data, error } = await supabase
        .from('lesson_history')
        .insert([historyData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating lesson history:', error);
      throw error;
    }
  },

  updateLessonHistory: async (id: string, historyData: Partial<LessonHistory>) => {
    try {
      const { data, error } = await supabase
        .from('lesson_history')
        .update(historyData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating lesson history:', error);
      throw error;
    }
  },

  deleteLessonHistory: async (id: string) => {
    try {
      const { error } = await supabase
        .from('lesson_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting lesson history:', error);
      throw error;
    }
  }
};
