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
    try {
      // 1. Get all goals related to this lesson
      const { data: mappings, error: mappingError } = await supabase
        .from('lesson_goal_mapping')
        .select('*, goals(*)')
        .eq('lesson_id', lessonId);
      
      if (mappingError) throw mappingError;
      
      // 2. For each related goal, update progress
      for (const mapping of mappings || []) {
        const { data: currentProgress, error: progressError } = await supabase
          .from('goal_progress')
          .select('*')
          .eq('goal_id', mapping.goal_id)
          .eq('user_id', userId)
          .single();
          
        if (progressError && progressError.code !== 'PGRST116') throw progressError;
        
        // Calculate new progress value
        const newProgress = {
          user_id: userId,
          goal_id: mapping.goal_id,
          progress_value: (currentProgress?.progress_value || 0) + mapping.contribution_weight,
          last_updated: new Date().toISOString(),
          status: 'in_progress' as GoalStatus
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
        
        // Update milestones reached
        await get().updateMilestoneProgress(mapping.goal_id, userId);
      }
      
      // Refresh progress data
      await get().fetchGoalProgress(userId);
      
    } catch (err) {
      const error = err as Error;
      console.error('Failed to track lesson completion:', error);
      toast.error('Failed to update goal progress');
    }
  },

  updateMilestoneProgress: async (goalId: string, userId: string) => {
    try {
      const { data: progress } = await supabase
        .from('goal_progress')
        .select('progress_value')
        .eq('goal_id', goalId)
        .eq('user_id', userId)
        .single();
        
      const { data: milestones } = await supabase
        .from('goal_milestones')
        .select('*')
        .eq('goal_id', goalId)
        .order('target_value', { ascending: true });
        
      if (!progress || !milestones) return;
      
      const milestonesReached = milestones.filter(m => 
        progress.progress_value >= m.target_value
      ).length;
      
      await supabase
        .from('goal_progress')
        .update({ 
          milestone_reached: milestonesReached,
          status: milestonesReached === milestones.length ? 'completed' : 'in_progress'
        })
        .eq('goal_id', goalId)
        .eq('user_id', userId);
        
    } catch (err) {
      console.error('Failed to update milestone progress:', err);
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
