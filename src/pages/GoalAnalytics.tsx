import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useGoalProgressStore } from '../store/goalProgressStore';
import { Goal, GoalProgress } from '../types/goal';
import { supabase } from '../lib/supabase';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import BackButton from '../components/BackButton';
import { toast } from 'react-hot-toast';

interface GoalAnalytics {
  completionRate: number;
  averageProgress: number;
  timeSpent: number;
}

interface ProgressTrend {
  date: string;
  value: number;
}

export default function GoalAnalytics() {
  const { user } = useAuth();
  const { progress, fetchGoalProgress } = useGoalProgressStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, GoalAnalytics>>({});
  const [progressTrend, setProgressTrend] = useState<ProgressTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First fetch user's goals IDs
      const { data: userGoalsData, error: userGoalsError } = await supabase
        .from('user_goals')
        .select('goals')
        .eq('user_id', user.id)
        .single();
      
      if (userGoalsError) throw userGoalsError;
      
      // Then fetch only the goals that belong to the user
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .in('id', userGoalsData?.goals || []);
      
      if (goalsError) throw goalsError;
      setGoals(goalsData || []);

      // Calculate analytics for each goal
      const analyticsData: Record<string, GoalAnalytics> = {};
      for (const goal of goalsData || []) {
        // Get goal progress
        const { data: progressData, error: progressError } = await supabase
          .from('goal_progress')
          .select('*')
          .eq('goal_id', goal.id)
          .eq('user_id', user.id)
          .single();

        if (progressError && progressError.code !== 'PGRST116') throw progressError;

        // Get lesson completions for this goal
        const { data: lessonMappings, error: mappingError } = await supabase
          .from('lesson_goal_mapping')
          .select('lesson_id')
          .eq('goal_id', goal.id);

        if (mappingError) throw mappingError;

        const lessonIds = lessonMappings?.map(m => m.lesson_id) || [];

        const { data: completions, error: completionError } = await supabase
          .from('lesson_completion')
          .select('*')
          .eq('user_id', user.id)
          .in('lesson_id', lessonIds);

        if (completionError) throw completionError;

        // Calculate analytics
        const completionRate = progressData ? (progressData.milestone_reached / 3) * 100 : 0;
        const averageProgress = progressData ? Math.min(progressData.progress_value, 100) : 0;
        const timeSpent = (completions?.length || 0) * 3; // 3 minutes per session

        analyticsData[goal.id] = {
          completionRate,
          averageProgress,
          timeSpent
        };
      }
      setAnalytics(analyticsData);

      // Calculate progress trend
      const trend = calculateProgressTrend(progress);
      setProgressTrend(trend);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgressTrend = (progressData: GoalProgress[]): ProgressTrend[] => {
    const today = new Date();
    const last30Days = eachDayOfInterval({
      start: subDays(today, 29),
      end: today
    });

    return last30Days.map(date => {
      const dayProgress = progressData.filter(p => 
        format(new Date(p.last_updated), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      const value = dayProgress.reduce((sum, p) => sum + p.progress_value, 0);

      return {
        date: format(date, 'MMM d'),
        value
      };
    });
  };

  const getTrendIndicator = (value: number) => {
    if (value > 70) {
      return <ArrowUpRight className="text-green-500" />;
    } else if (value < 30) {
      return <ArrowDownRight className="text-red-500" />;
    }
    return <Minus className="text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-mint-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Goal Analytics</h1>
            <p className="text-gray-600 mt-1">Track your progress and achievements</p>
          </div>
        </div>

        {/* Overall Progress Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Progress Trend</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#16A34A" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goal-specific Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const goalAnalytics = analytics[goal.id] || {
              completionRate: 0,
              averageProgress: 0,
              timeSpent: 0
            };

            return (
              <div key={goal.id} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">{goal.label}</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Completion Rate</span>
                      {getTrendIndicator(goalAnalytics.completionRate)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-mint-500 h-2 rounded-full" 
                        style={{ width: `${goalAnalytics.completionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600">Progress</p>
                      <p className="text-2xl font-semibold">
                        {Math.round(goalAnalytics.averageProgress)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Practice Time</p>
                      <p className="text-2xl font-semibold">
                        {Math.floor(goalAnalytics.timeSpent / 3)} sessions ({goalAnalytics.timeSpent}m)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
