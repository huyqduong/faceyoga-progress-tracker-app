import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
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
  const { profile } = useAuth();
  const { settings } = useSettingsStore();

  const mainTiles: MenuTile[] = [
    {
      path: '/dashboard',
      image: '/images/tiles/dashboard.jpg',
      label: 'Dashboard',
      description: 'View your stats and daily exercises',
      color: 'from-teal-500'
    },
    {
      path: '/exercises',
      image: '/images/tiles/exercises.jpg',
      label: 'Exercises',
      description: 'Browse and practice face yoga exercises',
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
      path: '/exercise-history',
      image: '/images/tiles/history.jpg',
      label: 'History',
      description: 'Review completed exercises',
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

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome back, {profile?.full_name || 'User'}!
        </h1>
        <p className="text-xl text-gray-600">
          Continue your face yoga journey
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
      </div>

      {profile?.is_admin && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminTiles.map((tile) => (
              <button
                key={tile.path}
                onClick={() => navigate(tile.path)}
                className="group relative h-48 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
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
      )}
    </div>
  );
}

export default Home;