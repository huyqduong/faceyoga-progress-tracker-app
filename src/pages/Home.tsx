import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSettingsStore } from '../store/settingsStore';

interface MenuTile {
  path: string;
  image: string;
  label: string;
  description: string;
  color: string;
}

function Home() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading, error, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const mainTiles: MenuTile[] = [
    {
      path: '/dashboard',
      image: '/images/tiles/dashboard.jpg',
      label: 'Dashboard',
      description: 'View your stats and daily lessons',
      color: 'from-teal-500'
    },
    {
      path: '/courses',
      image: '/images/tiles/courses.jpg',
      label: 'Courses',
      description: 'Learn structured face yoga programs',
      color: 'from-rose-500'
    },
    {
      path: '/lessons',
      image: '/images/tiles/lessons.jpg',
      label: 'Lessons',
      description: 'Browse and practice face yoga lessons',
      color: 'from-mint-500'
    },
    {
      path: '/progress',
      image: '/images/tiles/progress.jpg',
      label: 'Progress',
      description: 'Track your transformation journey',
      color: 'from-purple-500'
    },
    {
      path: '/goals',
      image: '/images/tiles/goals.jpg',
      label: 'Goals',
      description: 'View and update your goals',
      color: 'from-orange-500'
    },
    {
      path: '/lesson-history',
      image: '/images/tiles/history.jpg',
      label: 'History',
      description: 'Review completed lessons',
      color: 'from-indigo-500'
    },
    {
      path: '/profile',
      image: '/images/tiles/profile.jpg',
      label: 'Profile',
      description: 'Manage your account',
      color: 'from-gray-500'
    }
  ];

  const adminTiles: MenuTile[] = [
    {
      path: '/admin',
      image: '/images/tiles/admin.jpg',
      label: 'Admin Panel',
      description: 'Manage content and users',
      color: 'from-red-500'
    }
  ];

  if (authLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-mint-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">Error loading page: {error}</p>
        <button
          onClick={() => fetchSettings()}
          className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {settings?.home_title || 'Welcome back'}, {profile?.full_name || 'User'}!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {settings?.home_subtitle || 'Continue your face yoga journey'}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainTiles.map((tile) => (
          <button
            key={tile.path}
            onClick={() => navigate(tile.path)}
            className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0">
              <img
                src={tile.image}
                alt={tile.label}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${tile.color} to-transparent opacity-75`} />
            </div>
            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
              <h3 className="text-2xl font-bold mb-2">{tile.label}</h3>
              <p className="text-sm opacity-90">{tile.description}</p>
            </div>
          </button>
        ))}

        {profile?.role === 'admin' && adminTiles.map((tile) => (
          <button
            key={tile.path}
            onClick={() => navigate(tile.path)}
            className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0">
              <img
                src={tile.image}
                alt={tile.label}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${tile.color} to-transparent opacity-75`} />
            </div>
            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
              <h3 className="text-2xl font-bold mb-2">{tile.label}</h3>
              <p className="text-sm opacity-90">{tile.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;