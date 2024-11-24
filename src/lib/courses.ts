import { supabase } from './supabase';
import type { Course, CourseSection, SectionExercise } from './supabase-types';

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
        *,
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
  }
};
