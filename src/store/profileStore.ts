import { create } from 'zustand';
import type { Profile } from '../lib/supabase-types';
import { supabaseApi } from '../lib/supabase';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (profile: Partial<Profile> & { user_id: string }) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async (userId: string) => {
    if (!userId) {
      set({ error: 'Invalid user ID', loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const profile = await supabaseApi.getProfile(userId);
      set({ profile, loading: false });
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
        loading: false
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
    set({ profile: null, loading: false, error: null });
  },
}));