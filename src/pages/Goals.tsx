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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your goals...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <BackButton />
          <h1 className="text-2xl font-bold">My Goals</h1>
        </div>
        <button
          onClick={handleUpdateGoals}
          className="flex items-center space-x-2 px-4 py-2 text-mint-600 hover:text-mint-700 rounded-lg hover:bg-mint-50"
        >
          <Edit2 className="w-4 h-4" />
          <span>Update Goals</span>
        </button>
      </div>

      {userGoals ? (
        <div className="grid gap-8">
          {/* Goals Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Your Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userGoals.goals.map((goalId) => {
                const Icon = goalIcons[goalId as keyof typeof goalIcons];
                return (
                  <div key={goalId} className="bg-mint-50 rounded-xl p-6">
                    <Icon className="w-8 h-8 text-mint-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {goalTitles[goalId as keyof typeof goalTitles]}
                    </h3>
                    <p className="text-gray-600">
                      {goalDescriptions[goalId as keyof typeof goalDescriptions]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Commitment */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Time Commitment</h2>
            <div className="flex items-center space-x-2 text-lg text-gray-600">
              <Clock className="w-6 h-6 text-mint-600" />
              <span>{userGoals.time_commitment} minutes daily</span>
            </div>
          </div>

          {/* Concerns */}
          {userGoals.concerns && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Concerns</h2>
              <p className="text-gray-600">{userGoals.concerns}</p>
            </div>
          )}

          {/* AI Recommendations */}
          {userGoals.ai_recommendation && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">AI Recommendations</h2>
              <div className="bg-mint-50 rounded-lg p-6">
                <div className="prose prose-lg prose-mint max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-6" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-5" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-4" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                      li: ({node, ...props}) => <li className="ml-4" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-mint-500 pl-4 my-4 italic text-gray-700" {...props} />
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
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-600">No goals set yet. Click "Update Goals" to get started!</p>
        </div>
      )}
    </div>
  );
}

export default Goals;
