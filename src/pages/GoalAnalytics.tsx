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
      
      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*');
      
      if (goalsError) throw goalsError;
      setGoals(goalsData || []);

      // Fetch progress data
      await fetchGoalProgress(user.id);

      // Calculate analytics for each goal
      const analyticsData: Record<string, GoalAnalytics> = {};
      for (const goal of goalsData || []) {
        const goalProgress = progress.filter(p => p.goal_id === goal.id);
        analyticsData[goal.id] = await calculateAnalytics(goalProgress);
      }
      setAnalytics(analyticsData);

      // Calculate progress trend
      const trend = calculateProgressTrend(progress);
      setProgressTrend(trend);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = async (goalProgress: GoalProgress[]): Promise<GoalAnalytics> => {
    if (!goalProgress.length) {
      return {
        completionRate: 0,
        averageProgress: 0,
        timeSpent: 0
      };
    }

    const totalProgress = goalProgress.reduce((sum, p) => sum + p.progress_value, 0);
    const avgProgress = totalProgress / goalProgress.length;

    const timeSpent = goalProgress.reduce((total, p) => {
      const start = new Date(p.created_at);
      const end = new Date(p.last_updated);
      return total + (end.getTime() - start.getTime());
    }, 0) / (1000 * 60 * 60); // Convert to hours

    // Calculate completion rate based on status
    const completed = goalProgress.filter(p => p.status === 'completed').length;
    const completionRate = (completed / goalProgress.length) * 100;

    return {
      completionRate,
      averageProgress: avgProgress,
      timeSpent
    };
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
    if (value > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          <span>+{value.toFixed(1)}%</span>
        </div>
      );
    } else if (value < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDownRight className="w-4 h-4 mr-1" />
          <span>{value.toFixed(1)}%</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-gray-600">
        <Minus className="w-4 h-4 mr-1" />
        <span>0%</span>
      </div>
    );
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
                      <p className="text-gray-600">Average Progress</p>
                      <p className="text-2xl font-semibold">
                        {Math.round(goalAnalytics.averageProgress)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Time Spent</p>
                      <p className="text-2xl font-semibold">
                        {Math.round(goalAnalytics.timeSpent)}h
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
