import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Clock, Edit2, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BackButton from '../components/BackButton';

interface UserGoals {
  goals: string[];
  time_commitment: number;
  concerns: string;
  ai_recommendation: string;
}

const goalIcons = {
  jawline: Target,
  puffiness: Clock,
  elasticity: CheckCircle,
};

const goalTitles = {
  jawline: 'Tone Jawline',
  puffiness: 'Reduce Puffiness',
  elasticity: 'Improve Elasticity',
};

const goalDescriptions = {
  jawline: 'Strengthen and define your jawline muscles',
  puffiness: 'Decrease facial puffiness and improve circulation',
  elasticity: 'Enhance skin elasticity and reduce fine lines',
};

function Goals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserGoals = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setUserGoals(data);
      } catch (err) {
        console.error('Error fetching user goals:', err);
        toast.error('Failed to load goals');
      } finally {
        setLoading(false);
      }
    };

    fetchUserGoals();
  }, [user]);

  const handleUpdateGoals = async () => {
    if (!user) return;

    try {
      // Reset onboarding_completed flag
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: false })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Clear existing goals to force new AI recommendation
      const { error: goalsError } = await supabase
        .from('user_goals')
        .delete()
        .eq('user_id', user.id);

      if (goalsError) throw goalsError;

      // Navigate to onboarding page
      navigate('/onboarding');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to start goal update');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">My Goals</h1>
              <p className="text-lg text-gray-600 mt-2">Track and update your face yoga journey</p>
            </div>
          </div>
          <button
            onClick={handleUpdateGoals}
            className="flex items-center gap-2 px-6 py-3 bg-mint-500 text-white hover:bg-mint-600 
              rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Edit2 className="w-5 h-5" />
            <span className="font-medium">Update Goals</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-flex">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-mint-500 border-t-transparent"></div>
              </div>
              <p className="mt-6 text-lg text-gray-600">Loading your goals...</p>
            </div>
          </div>
        ) : userGoals ? (
          <div className="space-y-8">
            {/* Goals Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {userGoals.goals.map((goalId) => {
                  const Icon = goalIcons[goalId as keyof typeof goalIcons];
                  return (
                    <div 
                      key={goalId} 
                      className="group bg-gradient-to-br from-mint-50 to-white rounded-xl p-6 transition-all duration-300
                        hover:shadow-xl transform hover:-translate-y-2 border border-mint-100"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                          <Icon className="w-7 h-7 text-mint-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {goalTitles[goalId as keyof typeof goalTitles]}
                        </h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {goalDescriptions[goalId as keyof typeof goalDescriptions]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Commitment */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Time Commitment</h2>
              <div className="flex items-center gap-6">
                <div className="p-4 bg-gradient-to-br from-mint-100 to-mint-50 rounded-xl shadow-md">
                  <Clock className="w-8 h-8 text-mint-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {userGoals.time_commitment} <span className="text-xl font-medium text-gray-600">minutes daily</span>
                  </div>
                  <p className="text-lg text-gray-600 mt-2">Recommended practice duration for optimal results</p>
                </div>
              </div>
            </div>

            {/* Concerns */}
            {userGoals.concerns && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Concerns</h2>
                <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed text-lg">{userGoals.concerns}</p>
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {userGoals.ai_recommendation && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">AI Recommendations</h2>
                  <div className="px-4 py-1.5 bg-gradient-to-r from-mint-100 to-mint-50 rounded-full text-sm font-semibold text-mint-700 shadow-sm">
                    Personalized
                  </div>
                </div>
                <div className="bg-gradient-to-br from-mint-50 to-white rounded-xl p-8 border border-mint-100 shadow-inner">
                  <div className="prose prose-lg prose-mint max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="mb-6 leading-relaxed text-gray-700 text-lg" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-6 mt-8 text-gray-900" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-4 mt-6 text-gray-900" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-3 mt-5 text-gray-900" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside mb-6 space-y-3 text-gray-700 text-lg" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-6 space-y-3 text-gray-700 text-lg" {...props} />,
                        li: ({node, ...props}) => <li className="ml-6" {...props} />,
                        blockquote: ({node, ...props}) => (
                          <blockquote className="border-l-4 border-mint-300 pl-6 py-2 mb-6 italic text-gray-700" {...props} />
                        ),
                      }}
                    >
                      {userGoals.ai_recommendation}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <Target className="w-12 h-12 text-mint-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Goals Set Yet</h2>
              <p className="text-gray-600 mb-6">
                Start your face yoga journey by setting your goals and getting personalized recommendations.
              </p>
              <button
                onClick={handleUpdateGoals}
                className="inline-flex items-center gap-2 px-6 py-3 bg-mint-500 text-white 
                  rounded-lg hover:bg-mint-600 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Edit2 className="w-4 h-4" />
                <span>Set Your Goals</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Goals;
