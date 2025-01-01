import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
import type { Profile, Exercise, Progress } from './supabase-types';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'faceyoga_auth',
    storage: window.localStorage
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  db: {
    schema: 'public'
  }
});

// Add global error handler for Supabase
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    // Clear all local storage data
    for (const key in localStorage) {
      if (key.startsWith('faceyoga_')) {
        localStorage.removeItem(key);
      }
    }
    window.location.href = '/login';
  }
});

// Enhanced retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 5000; // 5 seconds

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Clear stale session data
      localStorage.removeItem('faceyoga_auth');
      toast.error('Your session has expired. Please sign in again.');
      window.location.href = '/login';
      throw new Error('No active session');
    }

    try {
      return await operation();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('JWT expired')) {
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !newSession) {
            toast.error('Session refresh failed. Please sign in again.');
            window.location.href = '/login';
            throw new Error('Session refresh failed');
          }
          // Retry operation with new session
          return await operation();
        }
        
        if (error.message.includes('connection')) {
          if (retries > 0) {
            const nextDelay = Math.min(delay * 1.5, MAX_RETRY_DELAY);
            toast.error(`Connection error. Retrying... (${retries} attempts left)`);
            await wait(delay);
            return retryOperation(operation, retries - 1, nextDelay);
          }
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Operation failed:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred');
    }
    throw error;
  }
};

export const supabaseApi = {
  async getProfile(userId: string): Promise<Profile | null> {
    return retryOperation(async () => {
      if (!userId) throw new Error('User ID is required');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, create a default one
          return this.createDefaultProfile(userId);
        }
        throw error;
      }

      return data;
    });
  },

  async createDefaultProfile(userId: string): Promise<Profile> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('No authenticated user');

    const defaultProfile = {
      user_id: userId,
      email: userData.user.email!,
      username: userData.user.email!.split('@')[0],
      full_name: '',
      role: 'user',
      streak: 0,
      lessons_completed: 0,
      practice_time: 0
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(defaultProfile)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(profile: Partial<Profile> & { user_id: string }): Promise<Profile> {
    return retryOperation(async () => {
      if (!profile.user_id) throw new Error('User ID is required');

      // Get current profile first
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', profile.user_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      // Add cache-busting to avatar_url if it's being updated
      if (profile.avatar_url) {
        profile.avatar_url = `${profile.avatar_url}?t=${Date.now()}`;
      }

      // If updating completed_lessons, update streak
      if ('completed_lessons' in profile && profile.completed_lessons?.length) {
        const completedLessons = currentProfile?.completed_lessons || [];
        const newLessons = profile.completed_lessons.filter(
          lesson => !completedLessons.includes(lesson)
        );
        
        if (newLessons.length > 0) {
          // Get completion dates from lesson_history
          const { data: lessonHistory } = await supabase
            .from('lesson_history')
            .select('completed_at')
            .eq('user_id', profile.user_id)
            .order('completed_at', { ascending: false });

          if (lessonHistory?.length) {
            const dates = lessonHistory.map(h => new Date(h.completed_at));
            dates.sort((a, b) => b.getTime() - a.getTime());

            let streak = 1;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // If there are previous completions, check for streak
            if (dates.length > 1) {
              const lastCompletion = new Date(dates[1]);
              lastCompletion.setHours(0, 0, 0, 0);

              // If last completion was yesterday, increment streak
              const diffDays = (today.getTime() - lastCompletion.getTime()) / (24 * 60 * 60 * 1000);
              if (diffDays === 1) {
                streak = (currentProfile?.streak || 0) + 1;
              } else if (diffDays > 1) {
                // Streak broken if last completion was more than a day ago
                streak = 1;
              } else {
                // Same day, keep current streak
                streak = currentProfile?.streak || 1;
              }
            }

            profile.streak = streak;
          }
        }
      }

      // Handle missing columns with default values
      const updatedProfile = {
        ...currentProfile,
        lessons_completed: currentProfile?.lessons_completed || 0,
        practice_time: currentProfile?.practice_time || 0,
        ...profile,
        updated_at: new Date().toISOString()
      };

      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('profiles')
        .upsert(updatedProfile)
        .select()
        .single();

      if (error) throw error;
      
      // Force a fresh fetch of the profile
      const { data: freshProfile, error: freshError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', profile.user_id)
        .single();

      if (freshError) throw freshError;
      return freshProfile;
    });
  },

  async uploadFile(file: File, bucket: string): Promise<string> {
    return retryOperation(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No authenticated user');

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    });
  },
  async uploadAvatar(userId: string, file: File): Promise<string> {
    return retryOperation(async () => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      // Delete any existing avatar first
      await supabase.storage
        .from('avatars')
        .remove([`${userId}/avatar.png`, `${userId}/avatar.jpg`, `${userId}/avatar.jpeg`]);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add cache-busting parameter to force refresh
      return `${publicUrl}?t=${Date.now()}`;
    });
  },
  async uploadProgressImage(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('progress')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('progress')
      .getPublicUrl(filePath);

    return publicUrl;
  },
  async createProgressEntry(userId: string, imageUrl: string, notes: string): Promise<Progress> {
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        notes
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  async getUserProgress(userId: string): Promise<Progress[]> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
  async signupForEarlyAccess(email: string) {
    const { data, error } = await supabase
      .from('early_access_signups')
      .insert([
        {
          email,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        throw new Error('This email has already been registered for early access.');
      }
      throw error;
    }

    return data;
  }
};