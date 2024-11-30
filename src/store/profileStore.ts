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
      const updatedProfile = await supabaseApi.updateProfile(profile);
      set((state) => ({
        profile: {
          ...state.profile!,
          ...updatedProfile
        },
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