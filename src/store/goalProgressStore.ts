import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { GoalProgress, GoalMilestone, GoalWithProgress, GoalStatus } from '../types/goal';
import { toast } from 'react-hot-toast';
import { useRewardStore } from './rewardStore';

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

      console.log('Updating goal status:', { goalId, status, userId: user.id });

      const timestamp = new Date().toISOString();
      let result;

      // Check if a progress entry exists
      const { data: existingProgress, error: checkError } = await supabase
        .from('goal_progress')
        .select('*')
        .eq('goal_id', goalId)
        .eq('user_id', user.id)
        .single();

      console.log('Existing progress:', existingProgress);

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (!existingProgress) {
        console.log('Creating new progress entry');
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
        console.log('Updating existing progress entry');
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

      // If goal is completed, update rewards
      if (status === 'completed' && (!existingProgress || existingProgress.status !== 'completed')) {
        try {
          console.log('Goal completed, updating rewards');
          // Fetch goal rewards info
          const { data: goalData, error: goalError } = await supabase
            .from('goals')
            .select('id, points_reward')
            .eq('id', goalId)
            .single();

          console.log('Goal points reward:', goalData?.points_reward);

          if (goalError) throw goalError;

          if (goalData?.points_reward) {
            // Update reward store state
            const rewardStore = useRewardStore.getState();
            console.log('Fetching rewards to update points');
            await rewardStore.fetchRewards(user.id);
          }
        } catch (rewardErr) {
          console.error('Error updating rewards:', rewardErr);
          toast.error('Failed to update rewards');
        }
      }

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
      console.error('Failed to update goal status:', error);
      toast.error('Failed to update goal status');
      throw error;
    }
  },

  trackLessonCompletion: async (lessonId: string, userId: string) => {
    try {
      // 1. Get all goals related to this lesson with their contribution weights
      const { data: mappings, error: mappingError } = await supabase
        .from('goal_lessons')
        .select('*, goals(*)')
        .eq('lesson_id', lessonId);
      
      if (mappingError) throw mappingError;
      
      // 2. For each related goal, update progress
      for (const mapping of mappings || []) {
        // Get current progress and milestones in parallel
        const [progressResult, milestonesResult] = await Promise.all([
          supabase
            .from('goal_progress')
            .select('*')
            .eq('goal_id', mapping.goal_id)
            .eq('user_id', userId)
            .single(),
          supabase
            .from('goal_milestones')
            .select('*')
            .eq('goal_id', mapping.goal_id)
            .order('target_value', { ascending: true })
        ]);
          
        if (progressResult.error && progressResult.error.code !== 'PGRST116') throw progressResult.error;
        if (milestonesResult.error) throw milestonesResult.error;

        const currentProgress = progressResult.data;
        const milestones = milestonesResult.data || [];
        
        // Calculate new progress value using the contribution weight
        const newProgressValue = (currentProgress?.progress_value || 0) + (mapping.contribution_weight || 10);
        
        // Calculate milestones reached with new progress value
        const milestonesReached = milestones.filter(m => newProgressValue >= m.target_value).length;
        
        // Prepare new progress data
        const newProgress = {
          user_id: userId,
          goal_id: mapping.goal_id,
          progress_value: newProgressValue,
          milestone_reached: milestonesReached,
          last_updated: new Date().toISOString(),
          status: milestonesReached === milestones.length ? 'completed' : 'in_progress' as GoalStatus
        };
        
        // If no existing progress, insert new record
        if (!currentProgress) {
          const { error: insertError } = await supabase
            .from('goal_progress')
            .insert([newProgress]);
            
          if (insertError) throw insertError;
        } else {
          // Update existing progress
          const { error: updateError } = await supabase
            .from('goal_progress')
            .update(newProgress)
            .eq('id', currentProgress.id);
            
          if (updateError) throw updateError;
        }
      }
      
      // Refresh progress data
      await get().fetchGoalProgress(userId);
      
    } catch (err) {
      const error = err as Error;
      console.error('Failed to track lesson completion:', error);
      toast.error('Failed to update goal progress');
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
