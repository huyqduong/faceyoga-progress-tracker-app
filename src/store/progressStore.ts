import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Progress } from '../lib/supabase-types';
import toast from 'react-hot-toast';

interface ProgressState {
  entries: Progress[];
  loading: boolean;
  error: Error | null;
  fetchProgress: () => Promise<void>;
  addProgress: (imageFile: File, notes: string) => Promise<void>;
  deleteProgress: (id: string) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  fetchProgress: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        console.error('No user found when fetching progress');
        return;
      }

      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ entries: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching progress:', error);
      set({ 
        error: error instanceof Error ? error : new Error('Failed to fetch progress'), 
        loading: false 
      });
      throw error;
    }
  },

  addProgress: async (imageFile: File, notes: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        console.error('No user found when adding progress');
        return;
      }

      set({ loading: true, error: null });
      // First, upload the image to storage
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('progress')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('progress')
        .getPublicUrl(filePath);

      // Create the progress entry
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          notes
        })
        .select()
        .single();

      if (progressError) {
        // If progress entry creation fails, clean up the uploaded file
        await supabase.storage
          .from('progress')
          .remove([filePath]);
        throw progressError;
      }

      // Update local state
      set((state) => ({
        entries: [progressData, ...state.entries],
        loading: false
      }));

      return progressData;
    } catch (error) {
      console.error('Error adding progress:', error);
      set({ 
        error: error instanceof Error ? error : new Error('Failed to save progress'), 
        loading: false 
      });
      throw error;
    }
  },

  deleteProgress: async (id: string) => {
    try {
      // First get the progress entry to get the image URL
      const { data: entry, error: fetchError } = await supabase
        .from('user_progress')
        .select('image_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Extract the file path from the URL
      const url = new URL(entry.image_url);
      const filePath = url.pathname.split('/').slice(-2).join('/');

      // Delete the image from storage
      const { error: storageError } = await supabase.storage
        .from('progress')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete the progress entry
      const { error: deleteError } = await supabase
        .from('user_progress')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state
      set((state) => ({
        entries: state.entries.filter(entry => entry.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting progress:', error);
      throw new Error('Failed to delete progress');
    }
  }
}));