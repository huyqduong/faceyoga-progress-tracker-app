import React, { useEffect } from 'react';
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
import { useExerciseStore } from '../store/exerciseStore';
import { useCourseStore } from '../store/courseStore';
import { useProgressStore } from '../store/progressStore';
import { format } from 'date-fns';

function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { exercises } = useExerciseStore();
  const { courses } = useCourseStore();
  const { entries: progressEntries } = useProgressStore();

  const stats = [
    { 
      icon: Calendar, 
      title: 'Daily Streak', 
      value: `${profile?.streak || 0} days`,
      color: 'bg-blue-100 text-blue-600',
      onClick: undefined
    },
    { 
      icon: Trophy, 
      title: 'Exercises Done', 
      value: `${profile?.exercises_done || 0}`,
      color: 'bg-green-100 text-green-600',
      onClick: () => navigate('/exercise-history')
    },
    { 
      icon: Clock, 
      title: 'Practice Time', 
      value: `${profile?.practice_time || 0} mins`,
      color: 'bg-purple-100 text-purple-600',
      onClick: undefined
    },
    { 
      icon: Target, 
      title: 'Available Exercises', 
      value: exercises.length.toString(),
      color: 'bg-mint-100 text-mint-600',
      onClick: () => navigate('/exercises')
    }
  ];

  // Get 3 random exercises for today's suggested routine
  const suggestedExercises = exercises
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Get latest courses
  const latestCourses = courses
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  // Get latest progress entries
  const latestProgress = progressEntries.slice(0, 2);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ' Back'}!
        </h1>
        <p className="text-lg text-gray-600">
          Track your progress, follow personalized routines, and achieve your facial fitness goals.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, title, value, color, onClick }) => (
          <div
            key={title}
            onClick={onClick}
            className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border border-gray-100 
              ${onClick ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Suggested Exercises */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Dumbbell className="w-6 h-6 text-mint-600" />
              <h2 className="text-xl font-semibold text-gray-900">Today's Exercises</h2>
            </div>
            <button 
              onClick={() => navigate('/exercises')}
              className="text-mint-600 hover:text-mint-700 flex items-center text-sm font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {suggestedExercises.map((exercise) => (
              <div 
                key={exercise.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={exercise.image_url}
                    alt={exercise.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{exercise.title}</h3>
                    <p className="text-sm text-gray-600">{exercise.duration}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/exercises/${exercise.id}`)}
                  className="flex items-center space-x-1 px-4 py-2 bg-mint-500 text-white rounded-lg text-sm font-medium hover:bg-mint-600 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Start</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Camera className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Recent Progress</h2>
            </div>
            <button 
              onClick={() => navigate('/progress')}
              className="text-purple-600 hover:text-purple-700 flex items-center text-sm font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {latestProgress.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {latestProgress.map((entry) => (
                <div key={entry.id} className="relative group">
                  <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
                    <img 
                      src={entry.image_url} 
                      alt={`Progress from ${format(new Date(entry.created_at), 'PPP')}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent text-white">
                    <time className="text-sm">
                      {format(new Date(entry.created_at), 'MMM d, yyyy')}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No progress photos yet.</p>
              <button
                onClick={() => navigate('/progress')}
                className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
              >
                Add Your First Photo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Latest Courses */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Award className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Latest Courses</h2>
          </div>
          <button 
            onClick={() => navigate('/courses')}
            className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
          >
            Browse All Courses
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/courses/${course.id}`)}
              className="group cursor-pointer"
            >
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden mb-4">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-mint-600 transition-colors">
                {course.title}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">{course.duration}</span>
                <span className="text-sm font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                  {course.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Your Goals</h2>
          </div>
          <button 
            onClick={() => navigate('/goals')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            <span>View Goals</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center py-4">
          <p className="text-gray-600">
            Track your progress and stay motivated with personalized goals.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;