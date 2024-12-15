import React, { useEffect, useState } from 'react';
import { Users, Book, Target, Clock, TrendingUp, Award, DollarSign, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardStats {
  totalUsers: number;
  totalLessons: number;
  totalCourses: number;
  activeUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  averageEngagement: number;
  completionRate: number;
  totalPracticeTime: number;
  dailyActiveUsers: { date: string; count: number }[];
  lessonCompletions: { date: string; count: number }[];
  categoryDistribution: { name: string; value: number }[];
  userStreaks: { streak: number; count: number }[];
}

interface LessonHistory {
  completed_at: string;
  user_id: string;
  practice_time: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalLessons: 0,
    totalCourses: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    averageEngagement: 0,
    completionRate: 0,
    totalPracticeTime: 0,
    dailyActiveUsers: [],
    lessonCompletions: [],
    categoryDistribution: [],
    userStreaks: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const calculateStreak = (completions: string[]): number => {
    if (!completions.length) return 0;

    const dates = completions
      .map(date => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastCompletion = dates[0];
    lastCompletion.setHours(0, 0, 0, 0);

    // If the last completion is not today or yesterday, streak is broken
    if (today.getTime() - lastCompletion.getTime() > 2 * 24 * 60 * 60 * 1000) {
      return 0;
    }

    for (let i = 0; i < dates.length - 1; i++) {
      const curr = dates[i];
      const next = dates[i + 1];
      curr.setHours(0, 0, 0, 0);
      next.setHours(0, 0, 0, 0);

      const diffDays = (curr.getTime() - next.getTime()) / (24 * 60 * 60 * 1000);

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch base stats
      const [
        { count: totalUsers },
        { count: totalLessons },
        { count: totalCourses },
        { count: activeUsers },
        { count: premiumUsers },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('lessons').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase
          .from('lesson_history')
          .select('user_id', { count: 'exact', head: true })
          .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('course_access')
          .select('user_id', { count: 'exact', head: true })
          .gt('expires_at', new Date().toISOString())
          .not('expires_at', 'is', null),
      ]);

      // Fetch lesson history for charts and practice time
      const { data: lessonHistory } = await supabase
        .from('lesson_history')
        .select('completed_at, user_id, practice_time')
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('completed_at', { ascending: true });

      // Process lesson history data
      const dailyData = new Map<string, number>();
      const userCompletions = new Map<string, string[]>();
      let totalPracticeTime = 0;

      lessonHistory?.forEach((record: LessonHistory) => {
        const date = new Date(record.completed_at).toISOString().split('T')[0];
        dailyData.set(date, (dailyData.get(date) || 0) + 1);

        const userDates = userCompletions.get(record.user_id) || [];
        userDates.push(record.completed_at);
        userCompletions.set(record.user_id, userDates);

        totalPracticeTime += record.practice_time || 0;
      });

      // Calculate streaks
      const streakCounts = new Map<number, number>();
      userCompletions.forEach(completions => {
        const streak = calculateStreak(completions);
        streakCounts.set(streak, (streakCounts.get(streak) || 0) + 1);
      });

      // Fetch category distribution
      const { data: lessons } = await supabase
        .from('lessons')
        .select('target_area');

      const categoryCount = new Map<string, number>();
      lessons?.forEach(lesson => {
        categoryCount.set(lesson.target_area, (categoryCount.get(lesson.target_area) || 0) + 1);
      });

      setStats({
        totalUsers: totalUsers || 0,
        totalLessons: totalLessons || 0,
        totalCourses: totalCourses || 0,
        activeUsers: activeUsers || 0,
        premiumUsers: premiumUsers || 0,
        totalRevenue: 0,
        averageEngagement: activeUsers ? (activeUsers / (totalUsers || 1)) * 100 : 0,
        completionRate: 0,
        totalPracticeTime: totalPracticeTime,
        dailyActiveUsers: Array.from(dailyData.entries()).map(([date, count]) => ({
          date,
          count,
        })),
        lessonCompletions: Array.from(dailyData.entries()).map(([date, count]) => ({
          date,
          count,
        })),
        categoryDistribution: Array.from(categoryCount.entries()).map(([name, value]) => ({
          name,
          value,
        })),
        userStreaks: Array.from(streakCounts.entries()).map(([streak, count]) => ({
          streak,
          count,
        })),
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 dark:border-mint-400" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/admin/settings')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.totalUsers}
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.activeUsers}
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-mint-100 dark:bg-mint-900/30">
                  <Activity className="w-6 h-6 text-mint-600 dark:text-mint-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Lessons</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.totalLessons}
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Premium Users</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.premiumUsers}
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Crown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Daily Active Users
              </h3>
              {/* Add your chart component here */}
            </div>

            {/* Lesson Completions Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Lesson Completions
              </h3>
              {/* Add your chart component here */}
            </div>

            {/* Category Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Category Distribution
              </h3>
              <div className="space-y-4">
                {stats.categoryDistribution.map(({ name, value }) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{name}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* User Streaks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                User Streaks
              </h3>
              <div className="space-y-4">
                {stats.userStreaks.map(({ streak, count }) => (
                  <div key={streak} className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {streak} day{streak !== 1 ? 's' : ''} streak
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">{count} users</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
