import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeImageUrl?: string;
  requiredPoints: number;
  earnedAt: string;
}

interface RewardState {
  totalPoints: number;
  level: string;
  streakDays: number;
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  fetchRewards: (userId: string) => Promise<void>;
  updatePoints: (userId: string, points: number) => Promise<void>;
  updateStreak: (userId: string, days: number) => Promise<void>;
  addAchievement: (userId: string, achievement: Achievement) => Promise<void>;
}

const calculateLevel = (points: number): string => {
  if (points >= 1500) return 'advanced';
  if (points >= 500) return 'intermediate';
  return 'beginner';
};

export const useRewardStore = create<RewardState>((set, get) => ({
  totalPoints: 0,
  level: 'beginner',
  streakDays: 0,
  achievements: [],
  loading: false,
  error: null,

  fetchRewards: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      console.log('Fetching rewards for user:', userId);

      // First, get or create user_rewards record
      const { data: existingRewards, error: rewardsError } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', userId);

      if (rewardsError) throw rewardsError;

      let userReward = existingRewards?.[0];

      if (!userReward) {
        console.log('Creating initial rewards record');
        const { data: newReward, error: createError } = await supabase
          .from('user_rewards')
          .insert({
            user_id: userId,
            total_points: 0,
            streak_days: 0,
            current_level: 'beginner'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating rewards record:', createError);
          throw createError;
        }

        userReward = newReward;
      }

      // Calculate total points from completed goals
      const { data: completedGoals, error: goalsError } = await supabase
        .from('goal_progress')
        .select(`
          goal_id,
          goals:goal_id (
            points_reward
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (goalsError) {
        console.error('Error fetching completed goals:', goalsError);
        throw goalsError;
      }

      console.log('Completed goals:', completedGoals);

      const totalPoints = completedGoals?.reduce((sum, goal) => {
        return sum + (goal.goals?.points_reward || 0);
      }, 0) || 0;

      console.log('Calculated total points:', totalPoints);

      // Update first user_rewards record with calculated points
      if (userReward) {
        const { data: updatedReward, error: updateError } = await supabase
          .from('user_rewards')
          .update({ 
            total_points: totalPoints,
            updated_at: new Date().toISOString()
          })
          .eq('id', userReward.id) // Use the specific record ID
          .select()
          .single();

        if (updateError) {
          console.error('Error updating rewards:', updateError);
          throw updateError;
        }

        userReward = updatedReward;
      }

      // Fetch user achievements with more details
      const { data: achievementData, error: achievementError } = await supabase
        .from('user_achievements')
        .select(`
          id,
          earned_at,
          achievement:achievement_id (
            id,
            title,
            description,
            badge_image_url,
            required_points
          )
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (achievementError) {
        console.error('Error fetching achievements:', achievementError);
        throw achievementError;
      }

      console.log('Achievement data:', achievementData);

      const achievements = achievementData?.map(item => ({
        id: item.achievement.id,
        title: item.achievement.title,
        description: item.achievement.description,
        badgeImageUrl: item.achievement.badge_image_url,
        requiredPoints: item.achievement.required_points,
        earnedAt: item.earned_at
      })) || [];

      // Calculate level based on points
      const level = calculateLevel(totalPoints);

      set({
        totalPoints,
        level,
        streakDays: userReward?.streak_days || 0,
        achievements,
        loading: false,
        error: null
      });

      console.log('Updated reward store state:', get());
    } catch (err) {
      const error = err as Error;
      console.error('Error in fetchRewards:', error);
      set({ error: error.message, loading: false });
    }
  },

  updatePoints: async (userId: string, points: number) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('user_rewards')
        .update({ total_points: points })
        .eq('user_id', userId);

      if (error) throw error;

      const level = calculateLevel(points);
      set({ totalPoints: points, level, loading: false, error: null });
      
      // Refresh rewards to ensure consistency
      get().fetchRewards(userId);
    } catch (err) {
      const error = err as Error;
      console.error('Error updating points:', error);
      set({ error: error.message, loading: false });
    }
  },

  updateStreak: async (userId: string, days: number) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('user_rewards')
        .update({ streak_days: days })
        .eq('user_id', userId);

      if (error) throw error;

      set({ streakDays: days, loading: false, error: null });
      
      // Refresh rewards to ensure consistency
      get().fetchRewards(userId);
    } catch (err) {
      const error = err as Error;
      console.error('Error updating streak:', error);
      set({ error: error.message, loading: false });
    }
  },

  addAchievement: async (userId: string, achievement: Achievement) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id
        });

      if (error) throw error;

      set(state => ({
        achievements: [...state.achievements, achievement],
        loading: false,
        error: null
      }));
      
      // Refresh rewards to ensure consistency
      get().fetchRewards(userId);
    } catch (err) {
      const error = err as Error;
      console.error('Error adding achievement:', error);
      set({ error: error.message, loading: false });
    }
  }
}));
