import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, ArrowLeft, BarChart2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import BackButton from '../components/BackButton';
import { Goal, UserGoals, GoalWithProgress } from '../types/goal';
import { useGoalProgressStore } from '../store/goalProgressStore';
import GoalProgressCard from '../components/goals/GoalProgressCard';
import GoalMilestones from '../components/goals/GoalMilestones';

function Goals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<GoalWithProgress | null>(null);
  
  const { 
    progress,
    milestones,
    fetchGoalProgress,
    fetchGoalMilestones,
    updateGoalStatus
  } = useGoalProgressStore();

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: true });

      if (goalsError) throw goalsError;
      setGoals(goalsData || []);

      // Fetch user goals
      const { data: userGoalsData, error: userGoalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userGoalsError) throw userGoalsError;
      setUserGoals(userGoalsData);

      // Fetch goal progress
      await fetchGoalProgress(user.id);

    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

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

  const handleGoalClick = async (goal: Goal) => {
    try {
      await fetchGoalMilestones(goal.id);
      const goalProgress = progress.find(p => p.goal_id === goal.id);
      setSelectedGoal({
        ...goal,
        progress: goalProgress,
        milestones: milestones
      });
    } catch (err) {
      console.error('Error fetching goal details:', err);
      toast.error('Failed to load goal details');
    }
  };

  const handleStatusChange = async (goalId: string, status: string) => {
    try {
      await updateGoalStatus(goalId, status);
      // Refresh progress data
      if (user) {
        await fetchGoalProgress(user.id);
        // Update selected goal if it's the one being modified
        if (selectedGoal?.id === goalId) {
          const updatedProgress = progress.find(p => p.goal_id === goalId);
          setSelectedGoal(prev => prev ? {
            ...prev,
            progress: updatedProgress
          } : null);
        }
      }
    } catch (err) {
      console.error('Error updating goal status:', err);
      toast.error('Failed to update goal status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">My Goals</h1>
              <p className="text-lg text-gray-600 mt-2">Track and update your face yoga journey</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/goals/analytics')}
              className="flex items-center gap-2 px-4 py-2 text-mint-600 hover:text-mint-700 
                font-medium transition-colors duration-200"
            >
              <BarChart2 className="w-5 h-5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={handleUpdateGoals}
              className="flex items-center gap-2 px-6 py-3 bg-mint-500 text-white hover:bg-mint-600 
                rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Edit2 className="w-5 h-5" />
              <span className="font-medium">Update Goals</span>
            </button>
          </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Goals List */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userGoals.goals.map((goalId) => {
                  const goal = goals.find(g => g.id === goalId);
                  if (!goal) return null;
                  
                  const goalProgress = progress.find(p => p.goal_id === goalId);
                  const goalWithProgress: GoalWithProgress = {
                    ...goal,
                    progress: goalProgress
                  };
                  
                  return (
                    <div 
                      key={goalId}
                      onClick={() => handleGoalClick(goal)}
                      className="cursor-pointer"
                    >
                      <GoalProgressCard
                        goal={goalWithProgress}
                        onStatusChange={(status) => handleStatusChange(goalId, status)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Goal Details */}
            <div className="lg:col-span-1">
              {selectedGoal ? (
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedGoal.label}</h2>
                  <GoalMilestones
                    milestones={selectedGoal.milestones || []}
                    currentProgress={selectedGoal.progress?.progress_value || 0}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <p className="text-gray-600">Select a goal to view details</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No goals found. Start by setting your goals.</p>
            <button
              onClick={handleUpdateGoals}
              className="mt-4 px-6 py-3 bg-mint-500 text-white rounded-lg hover:bg-mint-600"
            >
              Set Goals
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Goals;
