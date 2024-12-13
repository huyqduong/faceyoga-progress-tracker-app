import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { GoalProgress, GoalMilestone, GoalWithProgress, GoalStatus } from '../types/goal';
import { toast } from 'react-hot-toast';

interface GoalProgressState {
  progress: GoalProgress[];
  milestones: GoalMilestone[];
  progressLoading: boolean;
  milestonesLoading: boolean;
  error: string | null;
  
  // Fetch functions
  fetchGoalProgress: (userId: string) => Promise<void>;
  fetchGoalMilestones: (goalId: string) => Promise<void>;
  
  // Update functions
  updateGoalProgress: (progressData: Partial<GoalProgress>) => Promise<void>;
  updateGoalStatus: (goalId: string, status: GoalStatus) => Promise<void>;
  
  // Progress tracking
  trackLessonCompletion: (lessonId: string, userId: string) => Promise<void>;
  
  // Analytics
  getGoalAnalytics: (goalId: string) => Promise<{
    completionRate: number;
    averageProgress: number;
    timeSpent: number;
  }>;
}

export const useGoalProgressStore = create<GoalProgressState>((set, get) => ({
  progress: [],
  milestones: [],
  progressLoading: false,
  milestonesLoading: false,
  error: null,

  fetchGoalProgress: async (userId: string) => {
    set({ progressLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('goal_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      set({ progress: data || [], progressLoading: false, error: null });
    } catch (err) {
      const error = err as Error;
      console.error('Failed to fetch goal progress:', error);
      set({ error: error.message, progressLoading: false, progress: [] });
      toast.error('Failed to fetch goal progress');
    }
  },

  fetchGoalMilestones: async (goalId: string) => {
    set({ milestonesLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('goal_milestones')
        .select('*')
        .eq('goal_id', goalId)
        .order('target_value', { ascending: true });

      if (error) throw error;
      set({ milestones: data || [], milestonesLoading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, milestonesLoading: false });
      toast.error('Failed to fetch goal milestones');
    }
  },

  updateGoalProgress: async (progressData: Partial<GoalProgress>) => {
    try {
      // Fetch milestones for this goal to check completion
      const { data: milestones, error: milestonesError } = await supabase
        .from('goal_milestones')
        .select('*')
        .eq('goal_id', progressData.goal_id)
        .order('target_value', { ascending: true });

      if (milestonesError) throw milestonesError;

      // Calculate how many milestones have been reached
      const milestonesReached = (milestones || []).filter(
        milestone => progressData.progress_value >= milestone.target_value
      ).length;

      const { error } = await supabase
        .from('goal_progress')
        .upsert({
          ...progressData,
          milestone_reached: milestonesReached,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;
      
      // Refresh progress data
      if (progressData.user_id) {
        get().fetchGoalProgress(progressData.user_id);
      }
      
      toast.success('Progress updated successfully');
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to update progress');
      throw error;
    }
  },

  updateGoalStatus: async (goalId: string, status: GoalStatus) => {
    try {
      // Get the current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const timestamp = new Date().toISOString();
      let result;

      // Check if a progress entry exists
      const { data: existingProgress, error: checkError } = await supabase
        .from('goal_progress')
        .select('*')
        .eq('goal_id', goalId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (!existingProgress) {
        // Create new progress entry
        result = await supabase
          .from('goal_progress')
          .insert({
            goal_id: goalId,
            user_id: user.id,
            status,
            progress_value: 0,
            milestone_reached: 0,
            last_updated: timestamp,
            created_at: timestamp
          })
          .select()
          .single();
      } else {
        // Update existing progress entry
        result = await supabase
          .from('goal_progress')
          .update({ status, last_updated: timestamp })
          .eq('goal_id', goalId)
          .eq('user_id', user.id)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Update local state immediately without refetching
      set(state => ({
        progress: state.progress.map(p => 
          p.goal_id === goalId 
            ? { ...p, status, last_updated: timestamp }
            : p
        )
      }));

      toast.success('Goal status updated');
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to update goal status');
      throw error;
    }
  },

  trackLessonCompletion: async (lessonId: string, userId: string) => {
    if (!lessonId || !userId) {
      console.error('Missing lessonId or userId');
      return;
    }

    set({ progressLoading: true, error: null });
    
    try {
      // First check if this lesson was already completed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: existingEntry, error: checkError } = await supabase
        .from('lesson_history')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .gte('completed_at', today.toISOString())
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      // If already completed today, don't record again
      if (existingEntry) {
        console.log('Lesson already completed today');
        return;
      }

      // Get the lesson details for duration
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('duration')
        .eq('id', lessonId)
        .single();

      if (lessonError) {
        throw lessonError;
      }

      const duration = lessonData?.duration 
        ? typeof lessonData.duration === 'string'
          ? parseInt(lessonData.duration.split(' ')[0])
          : lessonData.duration
        : 0;

      // Record lesson completion
      const { error: historyError } = await supabase
        .from('lesson_history')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          practice_time: duration,
          completed_at: new Date().toISOString()
        });

      if (historyError) {
        throw historyError;
      }

      // Update user's profile with new lesson completion
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('lessons_completed, total_practice_time')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          lessons_completed: (currentProfile?.lessons_completed || 0) + 1,
          total_practice_time: (currentProfile?.total_practice_time || 0) + duration
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Get goals associated with this lesson
      const { data: goalMappings, error: mappingError } = await supabase
        .from('lesson_goal_mapping')
        .select(`
          goal_id,
          contribution_weight
        `)
        .eq('lesson_id', lessonId);

      if (mappingError) {
        throw mappingError;
      }

      // Update progress for each associated goal
      for (const mapping of goalMappings || []) {
        const { data: goalProgress, error: progressError } = await supabase
          .from('goal_progress')
          .select('*')
          .eq('goal_id', mapping.goal_id)
          .eq('user_id', userId)
          .single();

        if (progressError && progressError.code !== 'PGRST116') {
          throw progressError;
        }

        // Calculate new progress value
        const progressIncrement = mapping.contribution_weight || 1;
        const currentProgress = goalProgress?.progress_value || 0;
        const newProgress = Math.min(currentProgress + progressIncrement, 100);

        // Get milestones to check if any new ones are reached
        const { data: milestones, error: milestonesError } = await supabase
          .from('goal_milestones')
          .select('*')
          .eq('goal_id', mapping.goal_id)
          .order('target_value', { ascending: true });

        if (milestonesError) {
          throw milestonesError;
        }

        const milestonesReached = (milestones || []).filter(m => newProgress >= m.target_value).length;

        // Update or create goal progress
        const { error: updateError } = await supabase
          .from('goal_progress')
          .upsert({
            user_id: userId,
            goal_id: mapping.goal_id,
            progress_value: newProgress,
            milestone_reached: milestonesReached,
            last_updated: new Date().toISOString(),
            status: goalProgress?.status || 'in_progress'
          });

        if (updateError) {
          throw updateError;
        }
      }

      // Refresh goal progress after all updates
      await get().fetchGoalProgress(userId);

    } catch (error) {
      console.error('Error tracking lesson completion:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to track lesson completion' });
      throw error; // Re-throw to handle in the component
    } finally {
      set({ progressLoading: false });
    }
  },

  getGoalAnalytics: async (goalId: string) => {
    try {
      const { data: progressData, error: progressError } = await supabase
        .from('goal_progress')
        .select('progress_value, created_at, last_updated')
        .eq('goal_id', goalId);

      if (progressError) throw progressError;

      if (!progressData || progressData.length === 0) {
        return {
          completionRate: 0,
          averageProgress: 0,
          timeSpent: 0
        };
      }

      const totalProgress = progressData.reduce((sum, p) => sum + p.progress_value, 0);
      const averageProgress = totalProgress / progressData.length;

      const timeSpent = progressData.reduce((total, p) => {
        const start = new Date(p.created_at);
        const end = new Date(p.last_updated);
        return total + (end.getTime() - start.getTime());
      }, 0);

      // Calculate completion rate based on milestones
      const { data: milestones } = await supabase
        .from('goal_milestones')
        .select('target_value')
        .eq('goal_id', goalId);

      const totalMilestones = milestones?.length || 1;
      const completedMilestones = progressData.reduce(
        (count, p) => count + p.milestone_reached,
        0
      );

      return {
        completionRate: (completedMilestones / totalMilestones) * 100,
        averageProgress,
        timeSpent: timeSpent / (1000 * 60 * 60) // Convert to hours
      };
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to fetch goal analytics');
      throw error;
    }
  }
}));
