import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  Sparkles, 
  UserCircle, 
  Settings, 
  LogOut,
  Menu,
  X,
  GraduationCap,
  CreditCard,
  Layout,
  Book,
  MessageSquare,
  Image
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSettingsStore } from '../store/settingsStore';
import { useProfileStore } from '../store/profileStore';
import { signOut } from '../lib/auth';
import toast from 'react-hot-toast';
import { ThemeToggle } from './ThemeToggle';

function Navbar() {
  const location = useLocation();
  const { profile, user } = useAuth();
  const { settings, fetchSettings } = useSettingsStore();
  const { fetchProfile } = useProfileStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now());

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    setAvatarKey(Date.now());
  }, [profile?.avatar_url]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    } finally {
      setIsSigningOut(false);
    }
  };

  const menuItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      current: location.pathname === '/'
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Layout,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Lessons',
      href: '/lessons',
      icon: Book,
      current: location.pathname.startsWith('/lessons')
    },
    {
      name: 'Progress',
      href: '/progress',
      icon: Sparkles,
      current: location.pathname.startsWith('/progress')
    },
    {
      name: 'Feedback',
      href: '/feedback',
      icon: MessageSquare,
      current: location.pathname === '/feedback'
    }
  ];

  const profileMenuItems = [
    {
      name: 'Your Profile',
      href: '/profile',
      icon: UserCircle
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ];

  if (profile?.role === 'admin') {
    profileMenuItems.push({
      name: 'Admin',
      href: '/admin',
      icon: CreditCard
    });
  }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="-ml-2 mr-2 flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                {settings?.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt={settings?.business_name || 'Business Logo'}
                    className="h-8 w-auto mr-3"
                  />
                ) : (
                  <Image className="h-8 w-8 text-gray-400 mr-3" />
                )}
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {settings?.business_name || 'Business Name'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {settings?.tagline || 'Transform Your Face Naturally'}
                  </div>
                </div>
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    item.current
                      ? 'border-b-2 border-indigo-500 text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <ThemeToggle />
            <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="bg-white dark:bg-gray-800 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    {profile?.avatar_url ? (
                      <img
                        key={avatarKey}
                        src={`${profile.avatar_url}?t=${avatarKey}`}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-8 w-8 text-gray-400" />
                    )}
                  </button>
                </div>
                {isProfileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <item.icon className="h-5 w-5 mr-2" />
                        {item.name}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleSignOut();
                      }}
                      disabled={isSigningOut}
                      className="flex w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-base font-medium ${
                  item.current
                    ? 'bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                {profile?.avatar_url ? (
                  <img
                    key={avatarKey}
                    src={`${profile.avatar_url}?t=${avatarKey}`}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">
                  {profile?.full_name}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  {profile?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {profileMenuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600"
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  handleSignOut();
                }}
                disabled={isSigningOut}
                className="flex w-full items-center px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;