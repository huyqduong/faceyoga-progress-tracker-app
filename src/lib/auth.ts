import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { supabase } from './supabase';
import type { AuthError, User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  } catch (error) {
    const authError = error as AuthError;
    console.error('Error signing in:', authError);
    throw new Error(authError.message);
  }
};

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    const authError = error as AuthError;
    console.error('Error signing in with Google:', authError);
    throw new Error(authError.message);
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    // First, create the auth user
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (signUpError) throw signUpError;
    if (!user) throw new Error('User creation failed');

    // Create profile using the new user's ID
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        username: email.split('@')[0],
        full_name: '',
        role: 'user',
        streak: 0,
        lessons_completed: 0,
        practice_time: 0
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // If profile creation fails, we should clean up the auth user
      await supabase.auth.signOut();
      throw profileError;
    }

    return user;
  } catch (error) {
    const authError = error as AuthError;
    console.error('Error in signUp:', authError);
    throw new Error(authError.message);
  }
};

export const signOut = async () => {
  try {
    // First sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Then clear all local state
    useAuthStore.getState().setUser(null);
    useProfileStore.getState().clearProfile();

    // Clear any persisted session data
    localStorage.clear(); // Clear all localStorage to ensure no remnants
    
    // Force a full page reload to clear any remaining state
    window.location.replace('/login');
    
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    toast.error('Failed to sign out properly. Please try again.');
    return false;
  }
};