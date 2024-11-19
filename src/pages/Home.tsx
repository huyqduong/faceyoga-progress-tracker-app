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
      icon: Settings,
      label: 'Exercise Manager',
      description: 'Manage exercise database',
      color: 'bg-purple-600'
    },
    {
      path: '/admin/courses',
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {settings?.home_title || 'Face Yoga'}
        </h1>
        <p className="text-lg text-gray-600">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! What would you like to do today?
        </p>
      </header>

      {/* Main Menu Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mainTiles.map(({ path, icon: Icon, label, description, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 space-y-4"
          >
            <div className={`p-3 rounded-full ${color} text-white`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{label}</h3>
              <p className="text-sm text-gray-600 mt-1 hidden md:block">
                {description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Admin Section */}
      {profile?.role === 'admin' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mt-8">Admin Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {adminTiles.map(({ path, icon: Icon, label, description, color }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 space-y-4"
              >
                <div className={`p-3 rounded-full ${color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{label}</h3>
                  <p className="text-sm text-gray-600 mt-1 hidden md:block">
                    {description}
                  </p>
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