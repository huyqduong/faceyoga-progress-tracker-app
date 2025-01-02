import { supabase } from '../lib/supabase';

export const courseApi = {
  async hasAccessToLesson(userId: string, lessonId: string): Promise<boolean> {
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('id, is_premium')
        .eq('id', lessonId)
        .single();

      if (lessonError || !lessonData) {
        console.error('Error checking lesson:', lessonError);
        return false;
      }

      // If lesson is not premium, allow access
      if (!lessonData.is_premium) {
        return true;
      }

      // Check user subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('subscription')
        .eq('user_id', userId)
        .single();

      if (subscriptionError) {
        console.error('Error checking subscription:', subscriptionError);
        return false;
      }

      // If user has an active subscription, they have access
      if (subscriptionData?.subscription?.status === 'active') {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error in hasAccessToLesson:', error);
      return false;
    }
  },

  async checkCourseAccess(userId: string, courseId: string): Promise<boolean> {
    try {
      // Check if user has purchased this course
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('course_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (purchaseError) {
        console.error('Error checking course purchase:', purchaseError);
        return false;
      }

      return !!purchaseData;
    } catch (error) {
      console.error('Error in checkCourseAccess:', error);
      return false;
    }
  }
};
