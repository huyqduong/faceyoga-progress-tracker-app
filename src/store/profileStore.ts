import { create } from 'zustand';
import type { Profile } from '../lib/supabase-types';
import { supabaseApi } from '../lib/supabase';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  lastFetchedUserId: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (profile: Partial<Profile> & { user_id: string }) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  error: null,
  lastFetchedUserId: null,

  fetchProfile: async (userId: string) => {
    // Skip if we're already loading or if we've already fetched this user's profile
    if (!userId) {
      set({ error: 'Invalid user ID', loading: false });
      return;
    }

    set((state) => {
      // If we're already loading this user's profile or have it, skip
      if (state.loading && state.lastFetchedUserId === userId) {
        return state;
      }
      // If we already have this user's profile and no error, skip
      if (state.profile?.user_id === userId && !state.error) {
        return state;
      }
      return { ...state, loading: true, error: null, lastFetchedUserId: userId };
    });

    try {
      const profile = await supabaseApi.getProfile(userId);
      set({ profile, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
        loading: false 
      });
    }
  },

  updateProfile: async (profile: Partial<Profile> & { user_id: string }) => {
    if (!profile.user_id) {
      set({ error: 'Invalid user ID', loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      // If updating completed_lessons, ensure it's a valid UUID array
      if ('completed_lessons' in profile && profile.completed_lessons) {
        const currentProfile = await supabaseApi.getProfile(profile.user_id);
        if (!currentProfile) throw new Error('Profile not found');

        // Ensure completed_lessons is a UUID array
        const completedLessons = currentProfile.completed_lessons || [];
        const newLesson = profile.completed_lessons[0];
        
        // Validate UUID format
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!newLesson || !uuidPattern.test(newLesson)) {
          throw new Error('Invalid lesson ID format');
        }
        
        // Add the new lesson if it's not already in the array
        if (!completedLessons.includes(newLesson)) {
          profile.completed_lessons = [...completedLessons, newLesson];
        } else {
          profile.completed_lessons = completedLessons;
        }
      }

      const updatedProfile = await supabaseApi.updateProfile(profile);
      
      // Immediately update the local state with the new profile data
      set((state) => ({
        profile: updatedProfile,  
        loading: false,
        error: null
      }));
      
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update profile',
        loading: false 
      });
      throw error;
    }
  },

  clearProfile: () => {
    set({ profile: null, loading: false, error: null, lastFetchedUserId: null });
  },
}));