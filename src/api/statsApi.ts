import { supabase } from '../lib/supabase';

export const statsApi = {
  async getUserStats(userId: string) {
    try {
      // Get number of courses enrolled
      const { data: coursesData, error: coursesError } = await supabase
        .from('course_purchases')
        .select('course_id')
        .eq('user_id', userId);

      if (coursesError) throw coursesError;

      // Get number of lessons completed
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lesson_history')
        .select('id')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);

      if (lessonsError) throw lessonsError;

      // Get unique practice days
      const { data: practiceData, error: practiceError } = await supabase
        .from('lesson_history')
        .select('completed_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);

      if (practiceError) throw practiceError;

      // Calculate unique practice days
      const uniqueDays = new Set(
        practiceData.map(record => 
          new Date(record.completed_at).toISOString().split('T')[0]
        )
      );

      return {
        coursesEnrolled: coursesData.length,
        lessonsCompleted: lessonsData.length,
        daysPracticed: uniqueDays.size
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        coursesEnrolled: 0,
        lessonsCompleted: 0,
        daysPracticed: 0
      };
    }
  }
};
