import { create } from 'zustand';
import type { Lesson } from '../types';
import { lessonApi } from '../lib/lessons';

interface LessonState {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  categories: string[];
  fetchLessons: () => Promise<void>;
  fetchLessonsByCategory: (category: string) => Promise<void>;
  createLesson: (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLesson: (id: string, lesson: Partial<Lesson>) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
  reset: () => void;
  loadMore: () => Promise<void>;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  lessons: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  categories: ['Face', 'Neck', 'Jaw', 'Eyes', 'Forehead', 'Cheeks', 'Lips'],

  fetchLessons: async () => {
    const { page } = get();
    set({ loading: true, error: null });
    try {
      const lessons = await lessonApi.getLessons(page);
      set(state => {
        // Create a Set of existing lesson IDs for O(1) lookup
        const existingIds = new Set(state.lessons.map(l => l.id));
        // Filter out duplicates from new lessons
        const newLessons = lessons.filter(l => !existingIds.has(l.id));
        
        return { 
          lessons: page === 1 ? lessons : [...state.lessons, ...newLessons],
          loading: false,
          hasMore: lessons.length > 0
        };
      });
    } catch (error) {
      console.error('Error fetching lessons:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch lessons', loading: false });
    }
  },

  fetchLessonsByCategory: async (category: string) => {
    set({ loading: true, error: null, page: 1 });
    try {
      const lessons = await lessonApi.getLessonsByCategory(category);
      // Ensure unique lessons by ID
      const uniqueLessons = Array.from(
        new Map(lessons.map(l => [l.id, l])).values()
      );
      set({ lessons: uniqueLessons, loading: false, hasMore: lessons.length > 0 });
    } catch (error) {
      console.error('Error fetching lessons by category:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch lessons', loading: false });
    }
  },

  createLesson: async (lesson) => {
    set({ loading: true, error: null });
    try {
      const newLesson = await lessonApi.createLesson(lesson);
      if (!newLesson) throw new Error('Failed to create lesson');
      
      set(state => ({
        lessons: [newLesson, ...state.lessons],
        loading: false
      }));
    } catch (error) {
      console.error('Error creating lesson:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create lesson', loading: false });
      throw error;
    }
  },

  updateLesson: async (id, lesson) => {
    set({ loading: true, error: null });
    try {
      const updatedLesson = await lessonApi.updateLesson(id, lesson);
      set(state => ({
        lessons: state.lessons.map(ex => ex.id === id ? updatedLesson : ex),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating lesson:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update lesson', loading: false });
      throw error;
    }
  },

  deleteLesson: async (id) => {
    set({ loading: true, error: null });
    try {
      await lessonApi.deleteLesson(id);
      set(state => ({
        lessons: state.lessons.filter(ex => ex.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting lesson:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete lesson', loading: false });
      throw error;
    }
  },

  reset: () => {
    set({ lessons: [], loading: false, error: null, page: 1, hasMore: true });
  },

  loadMore: async () => {
    const { loading, hasMore } = get();
    if (loading || !hasMore) return;

    set(state => ({ page: state.page + 1 }));
    await get().fetchLessons();
  }
}));
