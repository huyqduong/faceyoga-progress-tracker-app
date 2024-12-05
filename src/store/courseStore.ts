import { create } from 'zustand';
import { courseApi } from '../lib/courses';
import type { Course, CourseSection, SectionExercise } from '../lib/supabase-types';

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
    exercises: string[];
  }[];
}

interface UpdateCourseData extends CreateCourseData {
  id: string;
}

interface CourseState {
  courses: Course[];
  sections: Record<string, CourseSection[]>;
  exercises: Record<string, SectionExercise[]>;
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchAllCourses: () => Promise<void>;
  fetchCourseSections: (courseId: string) => Promise<void>;
  fetchSectionExercises: (sectionId: string) => Promise<void>;
  createCourse: (data: CreateCourseData) => Promise<Course>;
  updateCourse: (id: string, data: UpdateCourseData) => Promise<Course>;
  deleteCourse: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  sections: {},
  exercises: {},
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchCourses: async () => {
    try {
      const courses = await courseApi.fetchCourses();
      set(state => ({ 
        courses,
        loading: state.loading // Preserve loading state
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch courses';
      set(state => ({ 
        error: message,
        loading: state.loading // Preserve loading state
      }));
    }
  },

  fetchAllCourses: async () => {
    try {
      const courses = await courseApi.fetchAllCourses();
      set(state => ({ 
        courses,
        loading: state.loading
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch courses';
      set(state => ({ 
        error: message,
        loading: state.loading
      }));
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

  fetchSectionExercises: async (sectionId: string) => {
    set(state => ({ loading: true, error: null }));
    try {
      // Check if we already have the exercises
      if (get().exercises[sectionId]) {
        set(state => ({ loading: false }));
        return;
      }

      const exercises = await courseApi.fetchSectionExercises(sectionId);
      set(state => ({
        exercises: { ...state.exercises, [sectionId]: exercises },
        loading: false
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch section exercises';
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
