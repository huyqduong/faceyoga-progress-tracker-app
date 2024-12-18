import { supabase } from './supabase';
import type { Course, CourseSection, SectionExercise, CoursePurchase, CourseAccess, SectionLesson } from './supabase-types';

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

  async fetchSectionLessons(sectionId: string): Promise<SectionLesson[]> {
    const { data, error } = await supabase
      .from('section_lessons')
      .select(`
        id,
        section_id,
        lesson_id,
        order_id,
        lesson:lessons (*)
      `)
      .eq('section_id', sectionId)
      .order('order_id');

    if (error) throw error;
    return data || [];
  },

  async fetchCourseLessons(courseId: string): Promise<Record<string, SectionLesson[]>> {
    const { data: sections } = await supabase
      .from('course_sections')
      .select('id')
      .eq('course_id', courseId);

    if (!sections?.length) return {};

    const sectionIds = sections.map(s => s.id);
    
    const { data, error } = await supabase
      .from('section_lessons')
      .select(`
        id,
        section_id,
        lesson_id,
        order_id,
        lesson:lessons (*)
      `)
      .in('section_id', sectionIds)
      .order('order_id');

    if (error) throw error;

    // Group lessons by section_id
    return (data || []).reduce((acc, lesson) => {
      if (!acc[lesson.section_id]) {
        acc[lesson.section_id] = [];
      }
      acc[lesson.section_id].push(lesson);
      return acc;
    }, {} as Record<string, SectionLesson[]>);
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
      // First check course_access table
      const { data: accessData, error: accessError } = await supabase
        .from('course_access')
        .select('id, expires_at')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      // If there's a valid access record, check expiry
      if (accessData) {
        // If expires_at is null, it's a lifetime access
        if (!accessData.expires_at) return true;
        
        // Check if access hasn't expired
        return new Date(accessData.expires_at) > new Date();
      }

      // If no access record found, check purchases
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('course_purchases')
        .select('id, status')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('status', 'completed')
        .maybeSingle();

      // If there's a completed purchase, user has access
      if (purchaseData) {
        return true;
      }

      return false;
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

  async hasAccessToLesson(userId: string, lessonId: string): Promise<boolean> {
    try {
      // Get the lesson's section info
      const { data: sectionLessons, error } = await supabase
        .from('section_lessons')
        .select(`
          section_id,
          section:course_sections (
            course_id
          )
        `)
        .eq('lesson_id', lessonId);

      if (error) throw error;

      // If lesson belongs to no course sections, it's considered free
      if (!sectionLessons || sectionLessons.length === 0) return true;

      // Check if user has access to any of the courses containing this lesson
      for (const sectionLesson of sectionLessons) {
        if (sectionLesson.section && await this.hasAccessToCourse(userId, sectionLesson.section.course_id)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking lesson access:', error);
      return false;
    }
  },

  async checkCourseAccess(userId: string, courseId: string): Promise<boolean> {
    try {
      // First check if it's a free course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('price')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      // If course has no price or price is 0, it's free
      if (!course?.price || course.price === 0) {
        return true;
      }

      // Check course access
      const { data: access, error: accessError } = await supabase
        .from('course_access')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .gte('expires_at', new Date().toISOString())
        .maybeSingle();

      if (accessError) throw accessError;

      // If user has valid access, return true
      if (access) {
        return true;
      }

      // Check purchases
      const { data: purchase, error: purchaseError } = await supabase
        .from('course_purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('status', 'completed')
        .maybeSingle();

      if (purchaseError) throw purchaseError;

      return !!purchase;
    } catch (error) {
      console.error('Error checking course access:', error);
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
