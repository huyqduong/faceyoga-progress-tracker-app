import { supabase } from '../lib/supabase';

export const courseApi = {
  async hasAccessToExercise(userId: string, exerciseId: string): Promise<boolean> {
    try {
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select('id, is_premium')
        .eq('id', exerciseId)
        .single();

      if (exerciseError || !exerciseData) {
        console.error('Error checking exercise:', exerciseError);
        return false;
      }

      // If exercise is not premium, allow access
      if (!exerciseData.is_premium) {
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
      console.error('Error in hasAccessToExercise:', error);
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
