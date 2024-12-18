import { create } from 'zustand';
import { courseApi } from '../lib/courses';
import type { Course, CourseSection, SectionLesson } from '../lib/supabase-types';
import { useLessonStore } from './lessonStore';

interface CreateCourseData {
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  image_url?: string;
  welcome_video?: string;
  sections: {
    title: string;
    description: string;
    lessons: string[];
  }[];
}

interface UpdateCourseData extends CreateCourseData {
  id: string;
}

interface CourseState {
  courses: Course[];
  sections: Record<string, CourseSection[]>;
  sectionLessons: Record<string, SectionLesson[]>;
  loading: boolean;
  loadingCourseIds: string[];
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchAllCourses: () => Promise<void>;
  fetchCourseSections: (courseId: string) => Promise<CourseSection[]>;
  fetchSectionLessons: (sectionId: string) => Promise<SectionLesson[]>;
  createCourse: (data: CreateCourseData) => Promise<Course>;
  updateCourse: (id: string, data: UpdateCourseData) => Promise<Course>;
  deleteCourse: (id: string) => Promise<void>;
  clearError: () => void;
  isLoadingCourse: (courseId: string) => boolean;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  sections: {},
  sectionLessons: {},
  loading: false,
  loadingCourseIds: [],
  error: null,

  clearError: () => {
    console.log('[CourseStore] Clearing error state');
    set({ error: null });
  },

  isLoadingCourse: (courseId: string) => {
    console.log(`[CourseStore] Checking loading state for course ${courseId}`);
    const isLoading = get().loadingCourseIds.includes(courseId);
    console.log(`[CourseStore] Course ${courseId} is loading: ${isLoading}`);
    return isLoading;
  },

  fetchCourses: async () => {
    console.log('[CourseStore] Starting fetchCourses');
    set({ loading: true, error: null });
    
    try {
      const courses = await courseApi.fetchCourses();
      console.log(`[CourseStore] Successfully fetched ${courses.length} courses`);
      set({ courses, loading: false });
    } catch (error) {
      console.error('[CourseStore] Error fetching courses:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch courses';
      set({ error: message, loading: false });
      throw error;
    }
  },

  fetchAllCourses: async () => {
    console.log('[CourseStore] Starting fetchAllCourses');
    set({ loading: true, error: null });
    
    try {
      const courses = await courseApi.fetchAllCourses();
      console.log(`[CourseStore] Successfully fetched ${courses.length} courses`);
      set({ courses, loading: false });
    } catch (error) {
      console.error('[CourseStore] Error fetching all courses:', error);
      const message = error instanceof Error ? error.message : 'Failed to fetch courses';
      set({ error: message, loading: false });
      throw error;
    }
  },

  fetchCourseSections: async (courseId: string) => {
    console.log(`[CourseStore] Starting fetchCourseSections for course ${courseId}`);
    
    // If already loading this course's sections, don't start another request
    if (get().loadingCourseIds.includes(courseId)) {
      console.log(`[CourseStore] Already loading sections for course ${courseId}`);
      return get().sections[courseId] || [];
    }

    set(state => ({ 
      loadingCourseIds: [...state.loadingCourseIds, courseId],
      error: null 
    }));

    try {
      // Ensure lessons are loaded first
      await useLessonStore.getState().ensureLessonsLoaded();
      
      console.log(`[CourseStore] Fetching sections for course ${courseId}`);
      const sections = await courseApi.fetchCourseSections(courseId);
      console.log(`[CourseStore] Successfully fetched ${sections.length} sections for course ${courseId}`);
      set(state => ({ 
        sections: { ...state.sections, [courseId]: sections },
        loadingCourseIds: state.loadingCourseIds.filter(id => id !== courseId)
      }));
      return sections;
    } catch (error) {
      console.error(`[CourseStore] Error fetching sections for course ${courseId}:`, error);
      const message = error instanceof Error ? error.message : 'Failed to fetch course sections';
      set(state => ({ 
        error: message,
        loadingCourseIds: state.loadingCourseIds.filter(id => id !== courseId)
      }));
      throw error;
    }
  },

  fetchSectionLessons: async (sectionId: string) => {
    console.log(`[CourseStore] Starting fetchSectionLessons for section ${sectionId}`);
    try {
      const lessons = await courseApi.fetchSectionLessons(sectionId);
      console.log(`[CourseStore] Successfully fetched ${lessons.length} lessons for section ${sectionId}:`, lessons);
      
      // Update the store with the new lessons
      set(state => ({
        sectionLessons: {
          ...state.sectionLessons,
          [sectionId]: lessons.map(item => ({
            ...item,
            lesson: item.lesson || null // Ensure lesson is never undefined
          }))
        }
      }));
      
      return lessons;
    } catch (error) {
      console.error(`[CourseStore] Error fetching lessons for section ${sectionId}:`, error);
      const message = error instanceof Error ? error.message : 'Failed to fetch section lessons';
      set({ error: message });
      throw error;
    }
  },

  createCourse: async (data: CreateCourseData) => {
    console.log('[CourseStore] Starting createCourse');
    set({ loading: true, error: null });
    
    try {
      const course = await courseApi.createCourse(data);
      console.log(`[CourseStore] Course created successfully: ${course.id}`);
      set((state) => ({
        courses: [course, ...state.courses],
        loading: false
      }));
      return course;
    } catch (error) {
      console.error('[CourseStore] Error creating course:', error);
      const message = error instanceof Error ? error.message : 'Failed to create course';
      set({ error: message, loading: false });
      throw error;
    }
  },

  updateCourse: async (id: string, data: UpdateCourseData) => {
    console.log(`[CourseStore] Starting updateCourse for course ${id}`);
    set({ loading: true, error: null });
    
    try {
      const updatedCourse = await courseApi.updateCourse(id, data);
      console.log(`[CourseStore] Course updated successfully: ${updatedCourse.id}`);
      set((state) => ({
        courses: state.courses.map(course => 
          course.id === id ? updatedCourse : course
        ),
        loading: false
      }));
      return updatedCourse;
    } catch (error) {
      console.error(`[CourseStore] Error updating course ${id}:`, error);
      const message = error instanceof Error ? error.message : 'Failed to update course';
      set({ error: message, loading: false });
      throw error;
    }
  },

  deleteCourse: async (id: string) => {
    console.log(`[CourseStore] Starting deleteCourse for course ${id}`);
    set({ loading: true, error: null });
    
    try {
      await courseApi.deleteCourse(id);
      console.log(`[CourseStore] Course deleted successfully: ${id}`);
      set((state) => ({
        courses: state.courses.filter(course => course.id !== id),
        sections: { ...state.sections, [id]: [] },
        loading: false
      }));
    } catch (error) {
      console.error(`[CourseStore] Error deleting course ${id}:`, error);
      const message = error instanceof Error ? error.message : 'Failed to delete course';
      set({ error: message, loading: false });
      throw error;
    }
  }
}));
