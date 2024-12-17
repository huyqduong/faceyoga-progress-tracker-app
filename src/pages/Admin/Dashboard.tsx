import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Book, 
  Target, 
  Clock, 
  TrendingUp, 
  Award, 
  DollarSign, 
  Activity,
  Settings
} from 'lucide-react';
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
    userStreaks: []
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Fetch total lessons
      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact' });

      // Fetch total courses
      const { count: totalCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact' });

      // Fetch active users (users who completed lessons in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers } = await supabase
        .from('lesson_history')
        .select('user_id', { count: 'exact', head: true })
        .gte('completed_at', thirtyDaysAgo.toISOString())
        .not('completed_at', 'is', null);

      // Fetch premium users
      const { count: premiumUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('is_premium', true);

      // Fetch daily active users for the last 30 days
      const { data: dailyActiveUsers } = await supabase
        .from('lesson_history')
        .select('completed_at, user_id')
        .gte('completed_at', thirtyDaysAgo.toISOString())
        .order('completed_at', { ascending: true });

      // Process daily active users data
      const dailyUsersMap = new Map();
      dailyActiveUsers?.forEach(entry => {
        const date = new Date(entry.completed_at).toLocaleDateString();
        dailyUsersMap.set(date, (dailyUsersMap.get(date) || new Set()).add(entry.user_id));
      });

      const dailyActiveUsersData = Array.from(dailyUsersMap).map(([date, users]) => ({
        date,
        count: (users as Set<string>).size
      }));

      // Calculate average engagement (average lessons completed per user)
      const totalCompletions = dailyActiveUsers?.length || 0;
      const averageEngagement = totalUsers ? totalCompletions / totalUsers : 0;

      // Calculate completion rate
      const { count: totalAttempts } = await supabase
        .from('lesson_history')
        .select('*', { count: 'exact' });

      const completionRate = totalAttempts ? (totalCompletions / totalAttempts) * 100 : 0;

      // Fetch total practice time
      const { data: practiceTimeData } = await supabase
        .from('lesson_history')
        .select('practice_time');

      const totalPracticeTime = practiceTimeData?.reduce((sum, entry) => sum + (entry.practice_time || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalLessons: totalLessons || 0,
        totalCourses: totalCourses || 0,
        activeUsers: activeUsers || 0,
        premiumUsers: premiumUsers || 0,
        totalRevenue: 0, // Implement when payment system is ready
        averageEngagement,
        completionRate,
        totalPracticeTime,
        dailyActiveUsers: dailyActiveUsersData,
        lessonCompletions: [], // Implement if needed
        categoryDistribution: [], // Implement if needed
        userStreaks: [] // Implement if needed
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
                  <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Active Users Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Active Users</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.dailyActiveUsers}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#colorUv)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Other metrics */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Engagement</p>
                  <div className="flex items-center mt-1">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className="h-2 bg-mint-500 rounded-full" 
                          style={{ width: `${Math.min(stats.averageEngagement * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {stats.averageEngagement.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
                  <div className="flex items-center mt-1">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {stats.completionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Practice Time</p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                      {Math.floor(stats.totalPracticeTime / 60)} hours {stats.totalPracticeTime % 60} minutes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
