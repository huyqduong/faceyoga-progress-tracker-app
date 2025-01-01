import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, ArrowLeft, BarChart2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import BackButton from '../components/BackButton';
import { Goal, UserGoals, GoalWithProgress, GoalStatus } from '../types/goal';
import { useGoalProgressStore } from '../store/goalProgressStore';
import GoalProgressCard from '../components/goals/GoalProgressCard';
import GoalMilestones from '../components/goals/GoalMilestones';

function Goals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<GoalWithProgress | null>(null);
  
  const { 
    progress,
    milestones,
    progressLoading,
    milestonesLoading,
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
      setDataLoading(true);
      
      const [goalsResult, userGoalsResult] = await Promise.all([
        supabase
          .from('goals')
          .select(`
            *,
            milestones:goal_milestones(*),
            lessons:goal_lessons(
              lesson:lessons(
                id,
                title,
                description,
                image_url,
                video_url
              )
            )
          `)
          .order('created_at', { ascending: true }),
        supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      if (goalsResult.error) throw goalsResult.error;
      if (userGoalsResult.error) throw userGoalsResult.error;

      setGoals(goalsResult.data || []);
      setUserGoals(userGoalsResult.data);

      if (userGoalsResult.data) {
        await fetchGoalProgress(user.id);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load goals');
      setGoals([]);
      setUserGoals(null);
    } finally {
      setDataLoading(false);
    }
  };

  const handleGoalClick = async (goal: Goal) => {
    if (!goal) return;
    
    try {
      await fetchGoalMilestones(goal.id);
      const goalProgress = progress.find(p => p.goal_id === goal.id);
      setSelectedGoal({ ...goal, progress: goalProgress });
    } catch (error) {
      console.error('Failed to fetch goal milestones:', error);
    }
  };

  const handleStatusChange = async (goalId: string, status: GoalStatus) => {
    if (!user?.id) return;
    
    try {
      await updateGoalStatus(goalId, status);
      if (selectedGoal?.id === goalId) {
        setSelectedGoal(prev => prev ? {
          ...prev,
          progress: { ...prev.progress, status }
        } : null);
      }
    } catch (error) {
      console.error('Failed to update goal status:', error);
    }
  };

  const handleUpdateGoals = async () => {
    if (!user) return;

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: false })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      const { error: goalsError } = await supabase
        .from('user_goals')
        .delete()
        .eq('user_id', user.id);

      if (goalsError) throw goalsError;

      navigate('/onboarding');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to start goal update');
    }
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  if (dataLoading && !userGoals) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading your goals...</p>
      </div>
    );
  }

  if (!userGoals) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't set any goals yet.</p>
        <button
          onClick={() => navigate('/onboarding')}
          className="px-6 py-3 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
        >
          Set Up Goals
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-0 sm:flex sm:items-center sm:justify-between mb-8 sm:mb-10">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">My Goals</h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Track and update your face yoga journey</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/goals/analytics')}
              className="flex items-center justify-center gap-2 px-4 py-2 text-mint-600 dark:text-mint-400 hover:text-mint-700 dark:hover:text-mint-300 
                font-medium transition-colors duration-200 bg-mint-50 dark:bg-mint-900/20 rounded-lg sm:bg-transparent dark:sm:bg-transparent"
            >
              <BarChart2 className="w-5 h-5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={handleUpdateGoals}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-mint-500 text-white hover:bg-mint-600 
                rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Edit2 className="w-5 h-5" />
              <span className="font-medium">Update Goals</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

          <div className="lg:col-span-1">
            {selectedGoal ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{selectedGoal.label}</h2>
                <div className="space-y-4">
                  <GoalMilestones 
                    goal={selectedGoal} 
                    milestones={selectedGoal.milestones || []} 
                    progress={selectedGoal.progress} 
                    loading={milestonesLoading} 
                  />
                  {selectedGoal.lessons && selectedGoal.lessons.length > 0 && (
                    <div className="bg-white shadow rounded-lg p-6">
                      <h3 className="text-lg font-medium mb-4">Related Lessons</h3>
                      <div className="space-y-3">
                        {selectedGoal.lessons.map(({ lesson }) => (
                          <div 
                            key={lesson.id} 
                            className="group flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => navigate(`/lessons/${lesson.id}`)}
                          >
                            {lesson.image_url ? (
                              <img 
                                src={lesson.image_url} 
                                alt={lesson.title}
                                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-mint-100 to-mint-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-mint-500 text-xl font-bold">
                                  {lesson.title.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 group-hover:text-mint-600 transition-colors mb-1 truncate">
                                {lesson.title}
                              </h4>
                              {lesson.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {stripHtml(lesson.description)}
                                </p>
                              )}
                            </div>
                            <div className="text-mint-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="w-5 h-5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">Select a goal to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Goals;
