import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AppSettings {
  id: string;
  business_name: string;
  tagline: string;
  home_title: string;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  about_text: string | null;
}

interface SettingsState {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single();

      if (error) throw error;
      set({ settings: data, loading: false });
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch settings',
        loading: false 
      });
    }
  },
}));