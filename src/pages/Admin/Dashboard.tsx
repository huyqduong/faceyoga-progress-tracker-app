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

  const stats_cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Total Lessons',
      value: stats.totalLessons.toLocaleString(),
      icon: Book,
      color: 'bg-purple-500',
      trend: '+8',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: Target,
      color: 'bg-amber-500',
      trend: '+18%',
    },
    {
      title: 'Premium Users',
      value: stats.premiumUsers.toLocaleString(),
      icon: Award,
      color: 'bg-cyan-500',
      trend: '+5',
    },
    {
      title: 'Total Practice Time',
      value: `${Math.round(stats.totalPracticeTime / 60)} mins`,
      icon: Clock,
      color: 'bg-emerald-500',
      trend: '+45 mins',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      trend: '+$420',
    },
    {
      title: 'Engagement Rate',
      value: `${stats.averageEngagement.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-rose-500',
      trend: '+2.4%',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate.toFixed(1)}%`,
      icon: Clock,
      color: 'bg-indigo-500',
      trend: '+5.3%',
    },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Monitor your app's performance and user engagement</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          disabled={loading}
          className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats_cards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 font-medium">{stat.trend}</span>
              <span className="text-gray-600 ml-2">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Active Users Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Active Users</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyActiveUsers}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
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
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Categories</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Streaks */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Streaks Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.userStreaks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="streak" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6">
                  {stats.userStreaks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lesson Completions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Lesson Completions</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.lessonCompletions}>
                <defs>
                  <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366F1"
                  fillOpacity={1}
                  fill="url(#colorCompletions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-mint-500 to-mint-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full py-2 px-4 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-left">
              Create New Lesson
            </button>
            <button className="w-full py-2 px-4 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-left">
              Add New Course
            </button>
            <button className="w-full py-2 px-4 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-left">
              View User Reports
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>New user signups</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Lessons completed</span>
              <span className="font-semibold">45</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Course enrollments</span>
              <span className="font-semibold">8</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white lg:col-span-1 sm:col-span-2 lg:row-span-1">
          <h3 className="text-lg font-semibold mb-2">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Server uptime</span>
              <span className="font-semibold">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>API response time</span>
              <span className="font-semibold">120ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Storage usage</span>
              <span className="font-semibold">45%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
