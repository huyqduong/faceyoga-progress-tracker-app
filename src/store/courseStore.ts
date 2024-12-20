import { create } from 'zustand';
import { courseApi } from '../lib/courses';
import type { Course, CourseSection, SectionLesson } from '../lib/supabase-types';
import { useLessonStore } from './lessonStore';
import { supabase } from '../lib/supabase';

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
  loadingCourseIds: string[];
  error: string | null;
  fetchCourses: () => Promise<void>;
  fetchAllCourses: () => Promise<void>;
  fetchCourseSections: (courseId: string) => Promise<CourseSection[]>;
  fetchSectionLessons: (sectionId: string) => Promise<SectionLesson[]>;
  createCourse: (data: CreateCourseData) => Promise<Course>;
  updateCourse: (courseId: string, courseData: Partial<Course>) => Promise<Course>;
  deleteCourse: (id: string) => Promise<void>;
  clearError: () => void;
  isLoadingCourse: (courseId: string) => boolean;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  sections: {},
  lessons: {},
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
    const { isLoadingCourse } = get();
    
    if (isLoadingCourse(courseId)) {
      console.warn(`[CourseStore] Already fetching sections for course ${courseId}`);
      return get().sections[courseId] || [];
    }

    try {
      set(state => ({
        loadingCourseIds: [...state.loadingCourseIds, courseId],
        error: null
      }));

      const { data: sections, error } = await supabase
        .from('course_sections')
        .select(`
          id,
          title,
          description,
          order_index,
          section_lessons (
            id,
            lesson_id,
            order_id,
            lessons (
              id,
              title,
              description,
              duration,
              difficulty,
              image_url,
              video_url,
              instructions,
              benefits,
              category,
              target_area
            )
          )
        `)
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;

      const processedSections = sections.map(section => ({
        ...section,
        order: section.order_index,
        lessons: section.section_lessons
          .sort((a, b) => a.order_id - b.order_id)
          .map(sl => sl.lesson_id) // Just store the lesson IDs in the section
      }));

      console.log('[CourseStore] Processed sections:', processedSections);

      set(state => ({
        sections: {
          ...state.sections,
          [courseId]: processedSections
        },
        error: null
      }));

      return processedSections;
    } catch (error) {
      console.error(`[CourseStore] Error fetching sections for course ${courseId}:`, error);
      set(state => ({
        error: error instanceof Error ? error.message : 'Failed to fetch course sections'
      }));
      return [];
    } finally {
      set(state => ({
        loadingCourseIds: state.loadingCourseIds.filter(id => id !== courseId)
      }));
    }
  },

  fetchSectionLessons: async (sectionId: string) => {
    const { lessons: currentLessons } = get();
    
    // Return cached lessons if available
    if (currentLessons[sectionId]) {
      return currentLessons[sectionId];
    }

    try {
      const lessons = await courseApi.fetchSectionLessons(sectionId);
      
      // Filter out lessons with missing data
      const validLessons = lessons.filter(item => item.lesson && item.lesson.id);

      set(state => ({
        lessons: {
          ...state.lessons,
          [sectionId]: validLessons
        }
      }));

      return validLessons;
    } catch (error) {
      console.error(`[CourseStore] Error fetching lessons for section ${sectionId}:`, error);
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

  updateCourse: async (courseId: string, courseData: Partial<Course>) => {
    try {
      console.log(`[CourseStore] Updating course ${courseId}`, courseData);
      set({ loading: true, error: null });
      
      // Extract sections from courseData to handle separately
      const { sections, ...courseUpdateData } = courseData;
      
      // Update course basic info
      const { data: updatedCourse, error } = await supabase
        .from('courses')
        .update(courseUpdateData)
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;

      console.log(`[CourseStore] Course ${courseId} updated successfully`, updatedCourse);
      
      // Update sections if provided
      if (sections) {
        console.log('[CourseStore] Updating sections:', sections);
        
        // First, get existing section IDs to clean up section_lessons
        const { data: existingSections } = await supabase
          .from('course_sections')
          .select('id')
          .eq('course_id', courseId);
        
        if (existingSections?.length) {
          // Delete existing section_lessons for all sections
          const { error: deleteLessonsError } = await supabase
            .from('section_lessons')
            .delete()
            .in('section_id', existingSections.map(s => s.id));
          
          if (deleteLessonsError) throw deleteLessonsError;
        }

        // Delete existing sections
        const { error: deleteError } = await supabase
          .from('course_sections')
          .delete()
          .eq('course_id', courseId);
        
        if (deleteError) throw deleteError;

        // Then insert new sections
        const sectionsToInsert = sections.map((section, index) => ({
          course_id: courseId,
          title: section.title,
          description: section.description,
          order_index: index,
        }));

        const { data: newSections, error: insertError } = await supabase
          .from('course_sections')
          .insert(sectionsToInsert)
          .select();

        if (insertError) throw insertError;

        // Update section_lessons for each section
        for (let i = 0; i < newSections.length; i++) {
          const section = newSections[i];
          const sectionLessons = sections[i].lessons || [];

          // Ensure we're using lesson IDs, not full lesson objects
          const lessonsToInsert = sectionLessons.map((lesson: any, index) => ({
            section_id: section.id,
            lesson_id: typeof lesson === 'string' ? lesson : lesson.id,
            order_id: index,
          }));

          if (lessonsToInsert.length > 0) {
            console.log(`[CourseStore] Inserting lessons for section ${section.id}:`, lessonsToInsert);
            
            const { error: lessonError } = await supabase
              .from('section_lessons')
              .insert(lessonsToInsert);

            if (lessonError) {
              console.error(`[CourseStore] Error inserting lessons:`, lessonError);
              throw lessonError;
            }
          }
        }
      }
      
      set(state => ({
        courses: state.courses.map(course => 
          course.id === courseId ? { ...course, ...updatedCourse } : course
        ),
        loading: false
      }));

      // Refetch course sections to ensure they're up to date
      await get().fetchCourseSections(courseId);
      
      return updatedCourse;
    } catch (error) {
      console.error(`[CourseStore] Error updating course ${courseId}:`, error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update course',
        loading: false 
      });
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
