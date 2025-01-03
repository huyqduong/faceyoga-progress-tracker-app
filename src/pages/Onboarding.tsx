import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Clock, Sparkles, ArrowLeft, Heart, Star, Sun, Moon, Smile, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { openaiApi } from '../lib/openai';
import toast from 'react-hot-toast';
import { useGoalProgressStore } from '../store/goalProgressStore';
import { useProfileStore } from '../store/profileStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: string;
  points_reward: number;
}

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateGoalStatus } = useGoalProgressStore();
  const { profile, updateProfile } = useProfileStore();
  const [step, setStep] = useState<'welcome' | 'quick-setup' | 'goals'>("welcome");
  const [quickSetup, setQuickSetup] = useState({
    name: '',
    timeCommitment: '10',
    experience: 'beginner',
    withGoals: false
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to fetch goals');
    }
  };

  const handleQuickStart = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Save basic profile
      await updateProfile({
        user_id: user.id,
        full_name: quickSetup.name,
        experience_level: quickSetup.experience as 'beginner' | 'intermediate' | 'advanced',
        onboarding_completed: true
      });

      // Save default time commitment
      await supabase.from('user_goals').upsert({
        user_id: user.id,
        time_commitment: parseInt(quickSetup.timeCommitment),
        updated_at: new Date().toISOString()
      });

      toast.success('Welcome to Face Yoga!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWithGoals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Save profile with goals
      await updateProfile({
        user_id: user.id,
        full_name: quickSetup.name,
        experience_level: quickSetup.experience as 'beginner' | 'intermediate' | 'advanced',
        onboarding_completed: true
      });

      // Save user goals
       await supabase.from('user_goals').upsert({
        user_id: user.id,
        goals: selectedGoals,
        time_commitment: parseInt(quickSetup.timeCommitment),
        updated_at: new Date().toISOString()
      });

      // Initialize goal progress
      for (const goalId of selectedGoals) {
        await updateGoalStatus(goalId, 'not_started');
      }

      toast.success('Goals saved successfully!');
      navigate('/goals');
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to save goals');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-white dark:from-gray-900 dark:to-gray-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {step === 'welcome' && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Welcome to Face Yoga</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Choose how you'd like to get started:
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setStep('quick-setup')}
                className="w-full py-3 px-4 bg-mint-600 text-white rounded-lg hover:bg-mint-700 transition-colors"
              >
                Quick Start (2 min)
              </button>
              <button
                onClick={() => {
                  setStep('quick-setup');
                  setQuickSetup(prev => ({ ...prev, withGoals: true }));
                }}
                className="w-full py-3 px-4 bg-white dark:bg-gray-800 text-mint-600 dark:text-mint-400 border-2 border-mint-600 dark:border-mint-400 rounded-lg hover:bg-mint-50 dark:hover:bg-gray-700 transition-colors"
              >
                Personalized Setup with Goals (5 min)
              </button>
            </div>
          </div>
        )}

        {step === 'quick-setup' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Quick Setup</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                What should we call you?
              </label>
              <input
                type="text"
                value={quickSetup.name}
                onChange={(e) => setQuickSetup(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-mint-500 focus:ring-mint-500 dark:bg-gray-700"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                How much time can you commit daily?
              </label>
              <select
                value={quickSetup.timeCommitment}
                onChange={(e) => setQuickSetup(prev => ({ ...prev, timeCommitment: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-mint-500 focus:ring-mint-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="20">20+ minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your experience with face yoga
              </label>
              <select
                value={quickSetup.experience}
                onChange={(e) => setQuickSetup(prev => ({ ...prev, experience: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-mint-500 focus:ring-mint-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Some Experience</option>
                <option value="advanced">Experienced</option>
              </select>
            </div>
            <div className="pt-4">
              <button
                onClick={() => quickSetup.withGoals ? setStep('goals') : handleQuickStart()}
                disabled={!quickSetup.name || loading}
                className="w-full py-3 px-4 bg-mint-600 text-white rounded-lg hover:bg-mint-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Setting up...' : quickSetup.withGoals ? 'Next: Select Goals' : 'Start Your Journey'}
              </button>
            </div>
          </div>
        )}

        {step === 'goals' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Select Your Goals</h2>
            <p className="text-gray-600 dark:text-gray-300">Choose the goals you'd like to work towards:</p>
            <div className="space-y-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => {
                    setSelectedGoals(prev =>
                      prev.includes(goal.id)
                        ? prev.filter(id => id !== goal.id)
                        : [...prev, goal.id]
                    );
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedGoals.includes(goal.id)
                      ? 'border-mint-500 bg-mint-50 dark:bg-gray-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-mint-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(goal.difficulty)}`}>
                      {goal.difficulty}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{goal.description}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 space-y-4">
              <button
                onClick={handleCompleteWithGoals}
                disabled={selectedGoals.length === 0 || loading}
                className="w-full py-3 px-4 bg-mint-600 text-white rounded-lg hover:bg-mint-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
              <button
                onClick={() => setStep('quick-setup')}
                className="w-full py-3 px-4 bg-white dark:bg-gray-800 text-mint-600 dark:text-mint-400 border-2 border-mint-600 dark:border-mint-400 rounded-lg hover:bg-mint-50 dark:hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Onboarding;
