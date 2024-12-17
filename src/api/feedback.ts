import { supabase } from '../lib/supabase';

export interface FeedbackData {
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'general';
  userId: string;
  email: string;
}

export type FeedbackStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

export const submitFeedback = async (data: FeedbackData) => {
  try {
    const { data: feedback, error } = await supabase
      .from('feedback')
      .insert([
        {
          title: data.title,
          description: data.description,
          type: data.type,
          user_id: data.userId,
          email: data.email,
          status: 'new'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return feedback;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export const getFeedback = async () => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
};

export const updateFeedbackStatus = async (id: string, status: FeedbackStatus) => {
  try {
    console.log('Updating feedback status:', { id, status });

    // Validate status
    const validStatuses: FeedbackStatus[] = ['new', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    // First verify the feedback exists
    const { data: checkData, error: checkError } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', id)
      .single();

    console.log('Current feedback data:', checkData);

    if (checkError) {
      console.error('Error checking feedback:', checkError);
      throw checkError;
    }
    if (!checkData) {
      throw new Error('Feedback not found');
    }

    // Use RPC to update status
    const { data: updateData, error: updateError } = await supabase
      .rpc('update_feedback_status', {
        feedback_id: id,
        new_status: status
      });

    console.log('RPC update result:', { updateData, updateError });

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('feedback')
      .select('*')
      .eq('id', id)
      .single();

    console.log('Verification data:', verifyData);

    if (verifyError) {
      throw verifyError;
    }

    if (!verifyData || verifyData.status !== status) {
      console.error('Status verification failed:', {
        expected: status,
        actual: verifyData?.status
      });
      throw new Error('Status update failed - please check database permissions');
    }

    return verifyData;
  } catch (error) {
    console.error('Error updating feedback status:', error);
    throw error;
  }
};
