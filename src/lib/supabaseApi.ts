import { supabase } from './supabase';

export const supabaseApi = {
  uploadFile: async (file: File, bucket: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  getSectionLessons: async (sectionId: string) => {
    try {
      const { data, error } = await supabase
        .from('section_lessons')
        .select(`
          lessons (
            id,
            title,
            description,
            duration,
            thumbnail_url,
            difficulty,
            category,
            is_premium
          )
        `)
        .eq('section_id', sectionId)
        .order('order');

      if (error) throw error;

      return data?.map(item => item.lessons) || [];
    } catch (error) {
      console.error('Error fetching section lessons:', error);
      throw error;
    }
  },

  addLessonToSection: async (sectionId: string, lessonId: string) => {
    try {
      // Get the current highest order
      const { data: currentLessons, error: fetchError } = await supabase
        .from('section_lessons')
        .select('order')
        .eq('section_id', sectionId)
        .order('order', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const newOrder = currentLessons?.[0]?.order ?? 0;

      const { error } = await supabase
        .from('section_lessons')
        .insert({
          section_id: sectionId,
          lesson_id: lessonId,
          order: newOrder + 1
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding lesson to section:', error);
      throw error;
    }
  },

  removeLessonFromSection: async (sectionId: string, lessonId: string) => {
    try {
      const { error } = await supabase
        .from('section_lessons')
        .delete()
        .match({ section_id: sectionId, lesson_id: lessonId });

      if (error) throw error;
    } catch (error) {
      console.error('Error removing lesson from section:', error);
      throw error;
    }
  },

  reorderSectionLessons: async (sectionId: string, lessonIds: string[]) => {
    try {
      const updates = lessonIds.map((lessonId, index) => ({
        section_id: sectionId,
        lesson_id: lessonId,
        order: index
      }));

      const { error } = await supabase
        .from('section_lessons')
        .upsert(updates);

      if (error) throw error;
    } catch (error) {
      console.error('Error reordering section lessons:', error);
      throw error;
    }
  }
};
