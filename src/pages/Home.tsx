import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  Camera, 
  MessageCircle, 
  BookOpen, 
  Target,
  History,
  Book,
  UserCircle,
  Settings,
  GraduationCap,
  Cog,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSettingsStore } from '../store/settingsStore';

interface MenuTile {
  path: string;
  icon: React.ElementType;
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
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'View your progress and daily exercises',
      color: 'bg-teal-500'
    },
    {
      path: '/exercises',
      icon: Dumbbell,
      label: 'Exercises',
      description: 'Browse and practice face yoga exercises',
      color: 'bg-mint-500'
    },
    {
      path: '/courses',
      icon: Book,
      label: 'Courses',
      description: 'Follow structured training programs',
      color: 'bg-blue-500'
    },
    {
      path: '/progress',
      icon: Camera,
      label: 'Progress',
      description: 'Track your transformation journey',
      color: 'bg-purple-500'
    },
    {
      path: '/coaching',
      icon: MessageCircle,
      label: 'AI Coach',
      description: 'Get personalized guidance',
      color: 'bg-green-500'
    },
    {
      path: '/goals',
      icon: Target,
      label: 'Goals',
      description: 'View and update your goals',
      color: 'bg-orange-500'
    },
    {
      path: '/exercise-history',
      icon: History,
      label: 'History',
      description: 'Review completed exercises',
      color: 'bg-indigo-500'
    },
    {
      path: '/resources',
      icon: BookOpen,
      label: 'Resources',
      description: 'Learn face yoga techniques',
      color: 'bg-pink-500'
    },
    {
      path: '/profile',
      icon: UserCircle,
      label: 'Profile',
      description: 'Manage your account',
      color: 'bg-gray-500'
    }
  ];

  const adminTiles: MenuTile[] = [
    {
      path: '/admin',
      icon: LayoutDashboard,
      label: 'Admin Dashboard',
      description: 'Access main admin dashboard',
      color: 'bg-purple-500'
    },
    {
      path: '/admin?tab=exercises',
      icon: Settings,
      label: 'Exercise Manager',
      description: 'Manage exercise database',
      color: 'bg-purple-600'
    },
    {
      path: '/admin?tab=courses',
      icon: GraduationCap,
      label: 'Course Manager',
      description: 'Manage course content',
      color: 'bg-purple-700'
    },
    {
      path: '/admin?tab=settings',
      icon: Cog,
      label: 'Settings Manager',
      description: 'Manage website settings',
      color: 'bg-purple-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-mint-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-mint-900">
            Welcome back, {profile?.full_name || 'User'}
          </h1>
          <p className="text-mint-600 mt-1">
            Continue your face yoga journey
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainTiles.map((tile) => (
            <button
              key={tile.path}
              onClick={() => navigate(tile.path)}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-mint-100 hover:shadow-md transition-all duration-200 text-left"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${tile.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                  {React.createElement(tile.icon, {
                    className: `w-6 h-6 ${tile.color.replace('bg-', 'text-').replace('-500', '-600')}`
                  })}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-mint-900 mb-1 group-hover:text-mint-700 transition-colors">
                    {tile.label}
                  </h3>
                  <p className="text-mint-600 text-sm">
                    {tile.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Admin Section */}
        {profile?.is_admin && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-mint-900 mb-4">Admin Controls</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminTiles.map((tile) => (
                <button
                  key={tile.path}
                  onClick={() => navigate(tile.path)}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-mint-100 hover:shadow-md transition-all duration-200 text-left"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${tile.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                      {React.createElement(tile.icon, {
                        className: `w-6 h-6 ${tile.color.replace('bg-', 'text-').replace('-500', '-600')}`
                      })}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-mint-900 mb-1 group-hover:text-mint-700 transition-colors">
                        {tile.label}
                      </h3>
                      <p className="text-mint-600 text-sm">
                        {tile.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;