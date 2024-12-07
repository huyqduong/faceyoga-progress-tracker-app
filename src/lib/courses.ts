import { supabase } from './supabase';
import type { Course, CourseSection, SectionExercise, CoursePurchase, CourseAccess } from './supabase-types';

interface CreateCourseWithSections {
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

interface UpdateCourseWithSections extends CreateCourseWithSections {
  id: string;
}

export const courseApi = {
  async fetchCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)  // Only fetch published courses by default
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async fetchAllCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async fetchCourseSections(courseId: string): Promise<CourseSection[]> {
    const { data, error } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (error) throw error;
    return data || [];
  },

  async fetchSectionExercises(sectionId: string): Promise<SectionExercise[]> {
    const { data, error } = await supabase
      .from('section_exercises')
      .select(`
        id,
        section_id,
        exercise_id,
        order_index,
        exercise:exercises (*)
      `)
      .eq('section_id', sectionId)
      .order('order_index');

    if (error) throw error;
    return data || [];
  },

  async createCourse(data: CreateCourseWithSections): Promise<Course> {
    const { sections, ...courseData } = data;

    // First create the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();

    if (courseError) throw courseError;

    // Then create sections with exercises
    if (sections.length > 0) {
      await this.createSections(course.id, sections);
    }

    return course;
  },

  async createSections(courseId: string, sections: CreateCourseWithSections['sections']) {
    // Create sections first
    const sectionsToCreate = sections.map((section, index) => ({
      course_id: courseId,
      title: section.title,
      description: section.description,
      order_index: index
    }));

    const { data: createdSections, error: sectionsError } = await supabase
      .from('course_sections')
      .insert(sectionsToCreate)
      .select();

    if (sectionsError) throw sectionsError;

    // Then create section exercises
    for (let i = 0; i < createdSections.length; i++) {
      const section = createdSections[i];
      const exerciseIds = sections[i].exercises;

      if (exerciseIds.length > 0) {
        const exercisesToCreate = exerciseIds.map((exerciseId, index) => ({
          section_id: section.id,
          exercise_id: exerciseId,
          order_index: index
        }));

        const { error: exercisesError } = await supabase
          .from('section_exercises')
          .insert(exercisesToCreate);

        if (exercisesError) throw exercisesError;
      }
    }

    return createdSections;
  },

  async updateCourse(id: string, data: UpdateCourseWithSections): Promise<Course> {
    const { sections, ...courseData } = data;

    // Update course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', id)
      .select()
      .single();

    if (courseError) throw courseError;

    // Delete existing sections and their exercises (cascade delete will handle exercises)
    const { error: deleteError } = await supabase
      .from('course_sections')
      .delete()
      .eq('course_id', id);

    if (deleteError) throw deleteError;

    // Create new sections with exercises
    if (sections.length > 0) {
      await this.createSections(id, sections);
    }

    return course;
  },

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async fetchUserPurchases(userId: string): Promise<CoursePurchase[]> {
    const { data, error } = await supabase
      .from('course_purchases')
      .select(`
        *,
        course:courses (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async fetchUserCourseAccess(userId: string): Promise<CourseAccess[]> {
    const { data, error } = await supabase
      .from('course_access')
      .select(`
        *,
        course:courses (*),
        purchase:course_purchases (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async hasAccessToCourse(userId: string | null | undefined, courseId: string): Promise<boolean> {
    // If no user ID is provided, they don't have access
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .from('course_access')
        .select('id, expires_at')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (error) {
        // PGRST116 means no rows found, which is expected for courses without access
        if (error.code === 'PGRST116') return false;
        throw error;
      }
      
      // If expires_at is null, it's a lifetime access
      if (!data.expires_at) return true;
      
      // Check if access hasn't expired
      return new Date(data.expires_at) > new Date();
    } catch (error) {
      console.error('Error checking course access:', error);
      return false;
    }
  },

  async hasAccessToExercise(userId: string, exerciseId: string): Promise<boolean> {
    if (!userId || !exerciseId) {
      console.error('Invalid userId or exerciseId');
      return false;
    }

    try {
      // Find all courses this exercise belongs to
      const { data: sectionExercises, error: exerciseError } = await supabase
        .from('section_exercises')
        .select(`
          section:course_sections!inner (
            course_id
          )
        `)
        .eq('exercise_id', exerciseId);

      if (exerciseError) {
        console.error('Error finding exercise courses:', exerciseError);
        return false;
      }

      if (!sectionExercises || sectionExercises.length === 0) {
        console.error('Exercise not found or not associated with any course');
        return false;
      }

      // Check if user has access to any of the courses containing this exercise
      for (const sectionExercise of sectionExercises) {
        const courseId = sectionExercise.section?.course_id;
        if (courseId) {
          const hasAccess = await this.hasAccessToCourse(userId, courseId);
          if (hasAccess) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking exercise access:', error);
      return false;
    }
  },

  async createPurchase(purchase: Omit<CoursePurchase, 'id' | 'created_at' | 'updated_at'>): Promise<CoursePurchase> {
    const { data, error } = await supabase
      .from('course_purchases')
      .insert(purchase)
      .select(`
        *,
        course:courses (*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async grantCourseAccess(access: Omit<CourseAccess, 'id' | 'created_at' | 'updated_at'>): Promise<CourseAccess> {
    const { data, error } = await supabase
      .from('course_access')
      .insert(access)
      .select(`
        *,
        course:courses (*),
        purchase:course_purchases (*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updatePurchaseStatus(
    purchaseId: string, 
    status: 'completed' | 'failed' | 'refunded',
    receiptUrl?: string
  ): Promise<CoursePurchase> {
    const { data, error } = await supabase
      .from('course_purchases')
      .update({ 
        status,
        receipt_url: receiptUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchaseId)
      .select(`
        *,
        course:courses (*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateAccessExpiry(accessId: string, expiresAt: string): Promise<CourseAccess> {
    const { data, error } = await supabase
      .from('course_access')
      .update({ 
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', accessId)
      .select(`
        *,
        course:courses (*),
        purchase:course_purchases (*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateLastAccessed(userId: string, courseId: string): Promise<void> {
    const { error } = await supabase
      .from('course_access')
      .update({ 
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) throw error;
  }
};
