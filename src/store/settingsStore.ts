import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AppSettings {
  id: string;
  business_name: string;
  tagline: string;
  home_title: string;
  home_subtitle: string;
  logo_url: string | null;
  description: string;
  contact_email: string | null;
  contact_phone: string | null;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  about_text: string | null;
  primary_color: string;
  secondary_color: string;
}

interface SettingsState {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS = {
  id: '2a7fcef4-2fc1-43d9-9231-ab071173f452',
  business_name: 'Face Yoga App',
  description: 'Transform your face naturally with our guided face yoga exercises',
  primary_color: '#4FD1C5',
  secondary_color: '#38B2AC',
  tagline: 'Your Natural Face Transformation Journey',
  home_title: 'Welcome to Face Yoga',
  home_subtitle: 'Transform your face naturally with guided exercises',
  logo_url: null,
  contact_email: null,
  contact_phone: null,
  about_text: null,
  social_links: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
  },
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      // Try to get existing settings with specific ID
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', DEFAULT_SETTINGS.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Settings don't exist, create them
          const { data: newSettings, error: insertError } = await supabase
            .from('app_settings')
            .insert([DEFAULT_SETTINGS])
            .select()
            .single();

          if (insertError) throw insertError;
          set({ settings: newSettings, loading: false });
          return;
        }
        throw error;
      }

      set({ settings: data, loading: false });
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch settings',
        loading: false,
        settings: null
      });
    }
  },
}));