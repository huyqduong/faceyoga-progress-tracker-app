import { create } from 'zustand';
import type { Lesson } from '../types';
import { lessonApi } from '../lib/lessons';
import { stripHtml } from '../utils/sanitize';

interface LessonState {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  categories: string[];
  lessonsLoaded: boolean;
  fetchLessons: () => Promise<void>;
  fetchLessonsByCategory: (category: string) => Promise<void>;
  createLesson: (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLesson: (id: string, lesson: Partial<Lesson>) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
  reset: () => void;
  loadMore: () => Promise<void>;
  clearError: () => void;
  getLessonById: (id: string) => Lesson | undefined;
  getLessonsByIds: (ids: string[]) => Lesson[];
  ensureLessonsLoaded: () => Promise<void>;
}

const processLesson = (lesson: any): Lesson => ({
  id: lesson.id,
  title: lesson.title,
  duration: lesson.duration,
  description: lesson.description,
  image_url: lesson.image_url,
  video_url: lesson.video_url,
  difficulty: lesson.difficulty,
  instructions: lesson.instructions,
  benefits: lesson.benefits,
  category: lesson.category,
  target_area: lesson.target_area,
  created_at: lesson.created_at,
  updated_at: lesson.updated_at,
  is_premium: lesson.is_premium ?? false
});

export const useLessonStore = create<LessonState>((set, get) => ({
  lessons: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  categories: ['Face', 'Neck', 'Jaw', 'Eyes', 'Forehead', 'Cheeks', 'Lips'],
  lessonsLoaded: false,

  clearError: () => set({ error: null }),

  getLessonById: (id: string) => {
    console.log(`[LessonStore] Getting lesson by id: ${id}`);
    const lesson = get().lessons.find(l => l.id === id);
    console.log(`[LessonStore] Found lesson: ${lesson ? 'yes' : 'no'}`);
    return lesson;
  },

  getLessonsByIds: (ids: string[]) => {
    const idSet = new Set(ids);
    return get().lessons.filter(l => idSet.has(l.id));
  },

  ensureLessonsLoaded: async () => {
    console.log('[LessonStore] Starting ensureLessonsLoaded');
    const state = get();
    
    if (state.lessonsLoaded) {
      console.log('[LessonStore] Lessons already loaded, skipping fetch');
      return;
    }
    
    if (state.loading) {
      console.log('[LessonStore] Lessons are currently loading, waiting...');
      await new Promise(resolve => {
        const checkLoading = () => {
          if (!get().loading) {
            resolve(undefined);
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
      return;
    }

    console.log('[LessonStore] Loading lessons...');
    set({ loading: true, error: null });

    try {
      const rawLessons = await lessonApi.getLessons(1, 1000);
      const lessons = rawLessons.map(processLesson);
      console.log(`[LessonStore] Successfully loaded ${lessons.length} lessons`);
      set({ 
        lessons, 
        loading: false, 
        lessonsLoaded: true,
        hasMore: false,
        page: 1
      });
    } catch (error) {
      console.error('[LessonStore] Error loading lessons:', error);
      const message = error instanceof Error ? error.message : 'Failed to load lessons';
      set({ 
        error: message, 
        loading: false,
        lessonsLoaded: false 
      });
      throw error;
    }
  },

  fetchLessons: async () => {
    try {
      set({ loading: true, error: null });
      const rawLessons = await lessonApi.getLessons(1, 1000);
      const lessons = rawLessons.map(processLesson);
      console.log(`[LessonStore] Successfully loaded ${lessons.length} lessons`);
      set({ 
        lessons,
        loading: false,
        hasMore: false,
        page: 1,
        lessonsLoaded: true
      });
    } catch (error) {
      console.error('[LessonStore] Error loading lessons:', error);
      const message = error instanceof Error ? error.message : 'Failed to load lessons';
      set({ 
        error: message, 
        loading: false,
        lessonsLoaded: false 
      });
      throw error;
    }
  },

  fetchLessonsByCategory: async (category: string) => {
    console.log(`[LessonStore] Starting fetchLessonsByCategory for category: ${category}`);
    set({ loading: true, error: null, page: 1 });
    try {
      const rawLessons = await lessonApi.getLessonsByCategory(category);
      const lessons = rawLessons.map(processLesson);
      console.log(`[LessonStore] Successfully loaded ${lessons.length} lessons for category: ${category}`);
      const uniqueLessons = Array.from(
        new Map(lessons.map(l => [l.id, l])).values()
      );
      set({ lessons: uniqueLessons, loading: false, hasMore: lessons.length > 0, lessonsLoaded: true });
    } catch (error) {
      console.error(`[LessonStore] Error loading lessons by category: ${category}`, error);
      set({ error: error instanceof Error ? error.message : 'Failed to load lessons', loading: false, lessonsLoaded: false });
    }
  },

  createLesson: async (lesson) => {
    console.log('[LessonStore] Starting createLesson');
    set({ loading: true, error: null });
    try {
      const rawNewLesson = await lessonApi.createLesson({
        ...lesson,
        is_premium: lesson.is_premium ?? false
      });
      if (!rawNewLesson) throw new Error('Failed to create lesson');
      
      const newLesson = processLesson(rawNewLesson);
      console.log(`[LessonStore] Successfully created lesson: ${newLesson.id}`);
      
      set(state => ({
        lessons: [newLesson, ...state.lessons],
        loading: false,
        lessonsLoaded: true
      }));
    } catch (error) {
      console.error('[LessonStore] Error creating lesson:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create lesson', loading: false, lessonsLoaded: false });
      throw error;
    }
  },

  updateLesson: async (id, lesson) => {
    console.log(`[LessonStore] Starting updateLesson for lesson: ${id}`);
    set({ loading: true, error: null });
    try {
      const rawUpdatedLesson = await lessonApi.updateLesson(id, {
        ...lesson,
        is_premium: lesson.is_premium ?? false
      });
      const updatedLesson = processLesson(rawUpdatedLesson);
      console.log(`[LessonStore] Successfully updated lesson: ${updatedLesson.id}`);
      set(state => ({
        lessons: state.lessons.map(ex => ex.id === id ? updatedLesson : ex),
        loading: false,
        lessonsLoaded: true
      }));
    } catch (error) {
      console.error(`[LessonStore] Error updating lesson: ${id}`, error);
      set({ error: error instanceof Error ? error.message : 'Failed to update lesson', loading: false, lessonsLoaded: false });
      throw error;
    }
  },

  deleteLesson: async (id) => {
    console.log(`[LessonStore] Starting deleteLesson for lesson: ${id}`);
    set({ loading: true, error: null });
    try {
      await lessonApi.deleteLesson(id);
      console.log(`[LessonStore] Successfully deleted lesson: ${id}`);
      set(state => ({
        lessons: state.lessons.filter(ex => ex.id !== id),
        loading: false,
        lessonsLoaded: true
      }));
    } catch (error) {
      console.error(`[LessonStore] Error deleting lesson: ${id}`, error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete lesson', loading: false, lessonsLoaded: false });
      throw error;
    }
  },

  reset: () => {
    console.log('[LessonStore] Starting reset');
    set({ lessons: [], loading: false, error: null, page: 1, hasMore: true, lessonsLoaded: false });
  },

  loadMore: async () => {
    console.log('[LessonStore] Starting loadMore');
    const { loading, hasMore } = get();
    if (loading || !hasMore) {
      console.log('[LessonStore] Lessons are already loaded or currently loading, skipping loadMore');
      return;
    }

    console.log('[LessonStore] Loading more lessons...');
    set(state => ({ page: state.page + 1 }));
    await get().fetchLessons();
  }
}));
