import { create } from 'zustand';
import { courseApi } from '../lib/courses';
import type { Course, CourseSection, SectionLesson } from '../lib/supabase-types';

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
  lessons: Record<string, SectionLesson[]>;
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchAllCourses: () => Promise<void>;
  fetchCourseSections: (courseId: string) => Promise<void>;
  fetchSectionLessons: (sectionId: string) => Promise<void>;
  createCourse: (data: CreateCourseData) => Promise<Course>;
  updateCourse: (id: string, data: UpdateCourseData) => Promise<Course>;
  deleteCourse: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  sections: {},
  lessons: {},
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      const courses = await courseApi.fetchCourses();
      set({ courses, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch courses';
      set({ error: message, loading: false });
    }
  },

  fetchAllCourses: async () => {
    set({ loading: true, error: null });
    try {
      const courses = await courseApi.fetchAllCourses();
      set({ courses, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch courses';
      set({ error: message, loading: false });
    }
  },

  fetchCourseSections: async (courseId: string) => {
    set(state => ({ loading: true, error: null }));
    try {
      // Check if we already have the sections
      if (get().sections[courseId]) {
        set(state => ({ loading: false }));
        return;
      }

      const sections = await courseApi.fetchCourseSections(courseId);
      set(state => ({ 
        sections: { ...state.sections, [courseId]: sections },
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch course sections';
      set(state => ({ 
        error: message,
        loading: false
      }));
    }
  },

  fetchSectionLessons: async (sectionId: string) => {
    set(state => ({ loading: true, error: null }));
    try {
      // Check if we already have the lessons
      if (get().lessons[sectionId]) {
        set(state => ({ loading: false }));
        return;
      }

      const lessons = await courseApi.fetchSectionLessons(sectionId);
      set(state => ({ 
        lessons: { ...state.lessons, [sectionId]: lessons },
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch section lessons';
      set(state => ({ 
        error: message,
        loading: false
      }));
    }
  },

  createCourse: async (data: CreateCourseData) => {
    set({ loading: true, error: null });
    try {
      const course = await courseApi.createCourse(data);
      set((state) => ({
        courses: [course, ...state.courses],
        loading: false
      }));
      return course;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create course';
      set({ error: message, loading: false });
      throw error;
    }
  },

  updateCourse: async (id: string, data: UpdateCourseData) => {
    set({ loading: true, error: null });
    try {
      const updatedCourse = await courseApi.updateCourse(id, data);
      set((state) => ({
        courses: state.courses.map(course => 
          course.id === id ? updatedCourse : course
        ),
        loading: false
      }));
      return updatedCourse;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update course';
      set({ error: message, loading: false });
      throw error;
    }
  },

  deleteCourse: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await courseApi.deleteCourse(id);
      set((state) => ({
        courses: state.courses.filter(course => course.id !== id),
        sections: { ...state.sections, [id]: [] },
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete course';
      set({ error: message, loading: false });
      throw error;
    }
  }
}));
