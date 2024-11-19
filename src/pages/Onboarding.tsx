import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Clock, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { openaiApi } from '../lib/openai';
import toast from 'react-hot-toast';

const goals = [
  { id: 'jawline', label: 'Tone Jawline', icon: Target },
  { id: 'puffiness', label: 'Reduce Puffiness', icon: Clock },
  { id: 'elasticity', label: 'Improve Elasticity', icon: Sparkles },
];

const timeOptions = [
  { value: '5', label: '5 minutes' },
  { value: '10', label: '10 minutes' },
  { value: '15', label: '15 minutes' },
  { value: '20', label: '20 minutes' },
];

function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [timeCommitment, setTimeCommitment] = useState('10');
  const [concerns, setConcerns] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [savingGoals, setSavingGoals] = useState(false);

  const getAIRecommendations = async () => {
    try {
      const goalLabels = selectedGoals.map(id => 
        goals.find(g => g.id === id)?.label || id
      );

      const prompt = `As a face yoga expert, provide personalized recommendations for a user with the following profile:

Goals: ${goalLabels.join(', ')}
Time Available: ${timeCommitment} minutes per day
Specific Concerns: ${concerns || 'None mentioned'}

Please provide:
1. A brief assessment of their goals
2. 2-3 specific face yoga exercises that would be most beneficial
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
      // Save user goals with the AI recommendation
      const { error: goalsError } = await supabase
        .from('user_goals')
        .upsert({
          user_id: user.id,
          goals: selectedGoals,
          time_commitment: parseInt(timeCommitment),
          concerns,
          ai_recommendation: aiRecommendation,
          updated_at: new Date().toISOString()
        });

      if (goalsError) throw goalsError;

      // Mark onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast.success('Goals saved successfully!');
      navigate('/goals');
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to save goals');
    } finally {
      setSavingGoals(false);
    }
  };

  const handleBack = () => {
    setAiRecommendation(null);
  };

  return (
    <div className="min-h-screen bg-mint-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Face Yoga</h1>
          <p className="text-lg text-gray-600">
            Let's personalize your experience by understanding your goals and preferences.
          </p>
        </div>

        {aiRecommendation ? (
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-900">Your Personalized Plan</h2>
            </div>

            <div className="bg-mint-50 rounded-lg p-6">
              <p className="text-gray-800 whitespace-pre-wrap">{aiRecommendation}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveGoals}
                disabled={savingGoals}
                className="px-6 py-3 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors disabled:opacity-50 flex items-center"
              >
                {savingGoals ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Saving Goals...
                  </>
                ) : (
                  'Save Goals and Continue'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
            {/* Goals Selection */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What are your goals?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {goals.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setSelectedGoals(prev =>
                        prev.includes(id)
                          ? prev.filter(g => g !== id)
                          : [...prev, id]
                      );
                    }}
                    className={`p-6 rounded-xl border-2 transition-colors ${
                      selectedGoals.includes(id)
                        ? 'border-mint-500 bg-mint-50'
                        : 'border-gray-200 hover:border-mint-300'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-4 ${
                      selectedGoals.includes(id) ? 'text-mint-600' : 'text-gray-400'
                    }`} />
                    <h3 className="font-medium text-gray-900">{label}</h3>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Commitment */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                How much time can you commit daily?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {timeOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setTimeCommitment(value)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      timeCommitment === value
                        ? 'border-mint-500 bg-mint-50'
                        : 'border-gray-200 hover:border-mint-300'
                    }`}
                  >
                    <span className={`font-medium ${
                      timeCommitment === value ? 'text-mint-600' : 'text-gray-600'
                    }`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Concerns */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Any specific concerns?
              </h2>
              <textarea
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
                placeholder="E.g., dark circles, fine lines, asymmetry..."
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-mint-500 focus:border-transparent"
                rows={4}
              />
            </div>

            {/* Get Recommendation Button */}
            <button
              onClick={handleGetRecommendation}
              disabled={loading || selectedGoals.length === 0}
              className="w-full py-3 px-4 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Getting AI Recommendations...
                </>
              ) : (
                'Get Personalized Plan'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Onboarding;