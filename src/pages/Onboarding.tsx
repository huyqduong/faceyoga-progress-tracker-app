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
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">Welcome to Face Yoga</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let's personalize your experience by understanding your goals and preferences.
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
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{aiRecommendation}</p>
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
                    Saving Goals...
                  </>
                ) : (
                  'Save Goals and Continue'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-10 space-y-12 transform transition-all duration-500 hover:shadow-xl">
            {/* Goals Selection */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What are your goals?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    className={`group p-8 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                      selectedGoals.includes(id)
                        ? 'border-mint-500 bg-gradient-to-br from-mint-50 to-white shadow-lg'
                        : 'border-gray-200 hover:border-mint-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-4 rounded-xl mb-6 transition-all duration-300 ${
                      selectedGoals.includes(id) 
                        ? 'bg-white shadow-md' 
                        : 'bg-gray-50 group-hover:bg-white group-hover:shadow-sm'
                    }`}>
                      <Icon className={`w-10 h-10 transition-colors duration-300 ${
                        selectedGoals.includes(id) ? 'text-mint-600' : 'text-gray-400 group-hover:text-mint-400'
                      }`} />
                    </div>
                    <h3 className={`text-xl font-semibold transition-colors duration-300 ${
                      selectedGoals.includes(id) ? 'text-mint-700' : 'text-gray-900'
                    }`}>{label}</h3>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Commitment */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How much time can you commit daily?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {timeOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setTimeCommitment(value)}
                    className={`group p-6 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                      timeCommitment === value
                        ? 'border-mint-500 bg-gradient-to-br from-mint-50 to-white shadow-lg'
                        : 'border-gray-200 hover:border-mint-300 hover:shadow-md'
                    }`}
                  >
                    <span className={`text-lg font-semibold transition-colors duration-300 ${
                      timeCommitment === value ? 'text-mint-700' : 'text-gray-700'
                    }`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Concerns */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Any specific concerns?
              </h2>
              <textarea
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
                placeholder="E.g., dark circles, fine lines, asymmetry..."
                className="w-full p-6 text-lg border-2 rounded-xl focus:ring-2 focus:ring-mint-500 focus:border-transparent
                  placeholder:text-gray-400 transition-shadow duration-300 hover:shadow-md"
                rows={4}
              />
            </div>

            {/* Get Recommendation Button */}
            <button
              onClick={handleGetRecommendation}
              disabled={loading || selectedGoals.length === 0}
              className="w-full py-6 px-8 bg-mint-500 text-white text-xl font-medium rounded-xl hover:bg-mint-600 
                transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 
                hover:shadow-lg transform hover:-translate-y-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                  Getting AI Recommendations...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Get Personalized Plan
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Onboarding;