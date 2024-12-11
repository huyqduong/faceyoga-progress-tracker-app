import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Target, 
  Trophy, 
  Clock, 
  Play, 
  ArrowRight,
  Dumbbell,
  Camera,
  ChevronRight,
  Award,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLessonStore } from '../store/lessonStore';
import { useCourseStore } from '../store/courseStore';
import { useProgressStore } from '../store/progressStore';
import { useProfileStore } from '../store/profileStore';
import { useLessonHistoryStore } from '../store/lessonHistoryStore';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { LessonHistory } from '../types';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, fetchProfile } = useProfileStore();
  const { lessons, fetchLessons } = useLessonStore();
  const { courses, fetchAllCourses } = useCourseStore();
  const { entries: progressEntries, fetchProgress } = useProgressStore();
  const { history, fetchHistory } = useLessonHistoryStore();

  const formatPracticeTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min${minutes === 1 ? '' : 's'}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchProfile(user.id),
        fetchLessons(),
        fetchAllCourses(),
        fetchProgress(user.id),
        fetchHistory(user.id)
      ]).catch(console.error);
    }
  }, [user, fetchProfile, fetchLessons, fetchAllCourses, fetchProgress, fetchHistory]);

  const stats = useMemo(() => {
    // Use profile's total_practice_time instead of calculating from history
    const totalPracticeTime = profile?.total_practice_time || 0;
    const totalLessons = history.length;
    const completedCourses = new Set(history.map(entry => entry.course_id)).size;
    const streakDays = history.reduce((acc, entry) => {
      const date = format(new Date(entry.completed_at), 'yyyy-MM-dd');
      acc.add(date);
      return acc;
    }, new Set<string>()).size;

    return {
      totalPracticeTime,
      totalLessons,
      completedCourses,
      streakDays
    };
  }, [history, profile]);

  // Get practice data for the last 7 days
  const practiceData = useMemo(() => {
    const today = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today
    });

    const dailyPractice = last7Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const practiceTime = history
        .filter(entry => format(new Date(entry.completed_at), 'yyyy-MM-dd') === dateStr)
        .reduce((acc, entry) => acc + (entry.practice_time || 0), 0);

      return {
        date: format(date, 'MMM d'),
        minutes: practiceTime
      };
    });

    return dailyPractice;
  }, [history]);

  const recentLessons = useMemo(() => {
    return history
      .slice(0, 3)
      .map(entry => {
        const lesson = lessons.find(l => l.id === entry.lesson_id);
        const course = courses.find(c => c.id === entry.course_id);
        return {
          ...entry,
          lesson,
          course
        };
      });
  }, [history, lessons, courses]);

  const progressImages = useMemo(() => {
    return progressEntries.slice(0, 3);
  }, [progressEntries]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Practice Time</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatPracticeTime(stats.totalPracticeTime)}
              </h3>
            </div>
            <Clock className="w-10 h-10 text-mint-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed Lessons</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalLessons}</h3>
            </div>
            <Play className="w-10 h-10 text-rose-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed Courses</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.completedCourses}</h3>
            </div>
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Practice Streak</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.streakDays} days</h3>
            </div>
            <Calendar className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Practice Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Practice History</h3>
            <button
              onClick={() => navigate('/lesson-history')}
              className="text-mint-600 hover:text-mint-700 text-sm font-medium flex items-center"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={practiceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#4FD1C5"
                  strokeWidth={2}
                  dot={{ fill: '#4FD1C5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Progress</h3>
            <button
              onClick={() => navigate('/progress')}
              className="text-mint-600 hover:text-mint-700 text-sm font-medium flex items-center"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {progressImages.map((entry) => (
              <div key={entry.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={entry.image_url}
                    alt="Progress"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-gray-500">
                    {format(new Date(entry.created_at), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">{entry.notes}</p>
                </div>
              </div>
            ))}
            {progressImages.length === 0 && (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No progress photos yet</p>
                <button
                  onClick={() => navigate('/progress')}
                  className="mt-2 text-mint-600 hover:text-mint-700 text-sm font-medium"
                >
                  Add Your First Photo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Lessons */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Lessons</h3>
          <button
            onClick={() => navigate('/lesson-history')}
            className="text-mint-600 hover:text-mint-700 text-sm font-medium flex items-center"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="space-y-4">
          {recentLessons.map((entry) => (
            <div key={entry.id} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={entry.lesson?.image_url || '/images/placeholder.jpg'}
                  alt={entry.lesson?.title}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.jpg';
                  }}
                />
              </div>
              <div className="flex-grow">
                <h4 className="font-medium text-gray-900">{entry.lesson?.title}</h4>
                <p className="text-sm text-gray-500">
                  {entry.course?.title ? `From ${entry.course.title}` : 'Free Lesson'}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(entry.completed_at), 'MMM d, yyyy')} •{' '}
                  {formatPracticeTime(entry.duration || 0)}
                </p>
              </div>
              <button
                onClick={() => navigate(`/lessons/${entry.lesson_id}`)}
                className="flex-shrink-0 text-mint-600 hover:text-mint-700"
              >
                <Play className="w-5 h-5" />
              </button>
            </div>
          ))}
          {recentLessons.length === 0 && (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No completed lessons yet</p>
              <button
                onClick={() => navigate('/lessons')}
                className="mt-2 text-mint-600 hover:text-mint-700 text-sm font-medium"
              >
                Start Your First Lesson
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Latest Courses */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Latest Courses</h3>
          <button
            onClick={() => navigate('/courses')}
            className="text-mint-600 hover:text-mint-700 text-sm font-medium flex items-center"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.slice(0, 3).map((course) => (
            <div
              key={course.id}
              className="group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={course.image_url || '/images/placeholder.jpg'}
                  alt={course.title}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.jpg';
                  }}
                />
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 group-hover:text-mint-600 transition-colors">
                  {course.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{course.description}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{course.duration}</span>
                  <span className="mx-2">•</span>
                  <Target className="w-4 h-4 mr-1" />
                  <span>{course.difficulty}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/courses/${course.id}`)}
                className="absolute inset-0 w-full h-full focus:outline-none"
              >
                <span className="sr-only">View course</span>
              </button>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No courses available yet</p>
              <p className="text-sm text-gray-400 mt-1">Check back soon for new courses!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;