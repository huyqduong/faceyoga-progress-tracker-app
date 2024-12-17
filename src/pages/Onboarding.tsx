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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [timeCommitment, setTimeCommitment] = useState('10');
  const [concerns, setConcerns] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [savingGoals, setSavingGoals] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const getAIRecommendations = async () => {
    try {
      const selectedGoalDetails = goals.filter(g => selectedGoals.includes(g.id));
      const goalInfo = selectedGoalDetails.map(g => ({
        title: g.title,
        difficulty: g.difficulty,
        duration: g.estimated_duration
      }));

      const prompt = `As a face yoga expert, provide personalized recommendations for a user with the following profile:

Goals: ${goalInfo.map(g => `${g.title} (${g.difficulty})`).join(', ')}
Time Available: ${timeCommitment} minutes per day
Specific Concerns: ${concerns || 'None mentioned'}

Please provide:
1. A brief assessment of their goals and estimated completion timeframes
2. 2-3 specific face yoga lessons that would be most beneficial
3. A suggested weekly routine that fits their time commitment
4. Additional tips for success

Format the response in a clear, encouraging way.`;
      
      const response = await openaiApi.sendMessage(prompt);
      return response;
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      throw new Error('Failed to get AI recommendations');
    }
  };

  const handleGetRecommendation = async () => {
    if (!user) return;
    if (selectedGoals.length === 0) {
      toast.error('Please select at least one goal');
      return;
    }

    setLoading(true);
    try {
      const recommendation = await getAIRecommendations();
      setAiRecommendation(recommendation);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      toast.error('Failed to get AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoals = async () => {
    if (!user || !aiRecommendation) return;

    setSavingGoals(true);
    try {
      // First, try to get the existing user goals
      const { data: existingGoals } = await supabase
        .from('user_goals')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Save user goals with the AI recommendation
      const { error: goalsError } = await supabase
        .from('user_goals')
        .upsert({
          ...(existingGoals?.id ? { id: existingGoals.id } : {}),
          user_id: user.id,
          goals: selectedGoals,
          time_commitment: parseInt(timeCommitment),
          concerns,
          ai_recommendation: aiRecommendation,
          updated_at: new Date().toISOString()
        });

      if (goalsError) throw goalsError;

      // Initialize goal progress for each selected goal
      for (const goalId of selectedGoals) {
        await updateGoalStatus(goalId, 'not_started');
      }

      // Mark onboarding as completed
      await updateProfile({
        user_id: user.id,
        onboarding_completed: true
      });

      toast.success('Assessment completed successfully!');
      navigate('/goals');
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to save assessment');
    } finally {
      setSavingGoals(false);
    }
  };

  const handleBack = () => {
    setAiRecommendation(null);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel the assessment? Your progress will be lost.')) {
      navigate('/');
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
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Navigation Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-mint-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-mint-50 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Face Yoga Assessment</h1>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-red-50 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-10 mt-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Face Yoga Assessment</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let's create your personalized face yoga journey by understanding your goals and preferences.
          </p>
        </div>

        {aiRecommendation ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 space-y-10 transform transition-all duration-500 hover:shadow-xl">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-3 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-mint-50 transition-all duration-300"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-bold text-gray-900">Your Personalized Plan</h2>
            </div>

            <div className="bg-gradient-to-br from-mint-50 to-white rounded-xl p-8 border border-mint-100">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiRecommendation}</ReactMarkdown>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveGoals}
                disabled={savingGoals}
                className="px-8 py-4 bg-mint-500 text-white text-lg font-medium rounded-xl hover:bg-mint-600 
                  transition-all duration-300 disabled:opacity-50 flex items-center gap-3 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {savingGoals ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving Assessment...
                  </>
                ) : (
                  'Complete Assessment'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-10 space-y-12 transform transition-all duration-500 hover:shadow-xl">
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">Select Your Goals</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => {
                      if (selectedGoals.includes(goal.id)) {
                        setSelectedGoals(selectedGoals.filter(id => id !== goal.id));
                      } else {
                        setSelectedGoals([...selectedGoals, goal.id]);
                      }
                    }}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedGoals.includes(goal.id)
                        ? 'border-mint-500 bg-mint-50'
                        : 'border-gray-100 hover:border-mint-200'
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{goal.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(goal.difficulty)}`}>
                        {goal.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">
                        {goal.estimated_duration} • {goal.points_reward} points
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Time Commitment
                </label>
                <select
                  value={timeCommitment}
                  onChange={(e) => setTimeCommitment(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500"
                >
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Concerns (Optional)
                </label>
                <textarea
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  placeholder="Any specific areas you'd like to focus on?"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-500 h-32 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGetRecommendation}
                disabled={loading || selectedGoals.length === 0}
                className="px-8 py-4 bg-mint-500 text-white text-lg font-medium rounded-xl hover:bg-mint-600 
                  transition-all duration-300 disabled:opacity-50 flex items-center gap-3 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Getting Recommendations...
                  </>
                ) : (
                  'Get Personalized Plan'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Onboarding;