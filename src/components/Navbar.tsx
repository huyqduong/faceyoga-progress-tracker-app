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
  Book
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSettingsStore } from '../store/settingsStore';
import { signOut } from '../lib/auth';
import toast from 'react-hot-toast';
import { ThemeToggle } from './ThemeToggle';

function Navbar() {
  const location = useLocation();
  const { profile } = useAuth();
  const { settings, fetchSettings } = useSettingsStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
      setIsSigningOut(false);
    }
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Business Name */}
          <Link to="/" className="flex-shrink-0 flex items-center space-x-3">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.business_name}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center bg-mint-50 dark:bg-mint-900/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-mint-500 dark:text-mint-400" />
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                {settings?.business_name || 'Face Yoga'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
                {settings?.tagline || 'Transform Your Face Naturally'}
              </p>
            </div>
            {/* Mobile Business Name */}
            <h1 className="sm:hidden text-lg font-bold text-gray-900 dark:text-white">
              {settings?.business_name?.split(' ').map(word => word[0]).join('') || 'FY'}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                location.pathname === '/' 
                  ? 'text-mint-600 dark:text-mint-400 bg-mint-50 dark:bg-mint-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </span>
            </Link>

            <Link
              to="/my-courses"
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                location.pathname === '/my-courses' 
                  ? 'text-mint-600 dark:text-mint-400 bg-mint-50 dark:bg-mint-900/20' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Book className="w-4 h-4" />
                <span>My Courses</span>
              </span>
            </Link>

            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                location.pathname === '/dashboard'
                  ? 'text-mint-600 dark:text-mint-400 bg-mint-50 dark:bg-mint-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Layout className="w-4 h-4" />
                <span>Dashboard</span>
              </span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === '/admin'
                    ? 'text-mint-600 dark:text-mint-400 bg-mint-50 dark:bg-mint-900/20'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Admin Panel</span>
                </span>
              </Link>
            )}

            {/* Desktop Profile Menu */}
            <div className="relative ml-2">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-mint-50 dark:hover:bg-gray-700"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-mint-100 dark:bg-mint-900/20 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-mint-600 dark:text-mint-400" />
                  </div>
                )}
                <span className="text-gray-700 dark:text-gray-300 hidden xl:inline">{profile?.full_name || 'Profile'}</span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-100 dark:border-gray-700">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-mint-50 dark:hover:bg-gray-700"
                    onClick={closeAllMenus}
                  >
                    <UserCircle className="w-4 h-4 inline-block mr-2" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4 inline-block mr-2" />
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-mint-500 hover:text-mint-600 hover:bg-mint-50"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-2">
                <Link
                  to="/"
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === '/'
                      ? 'text-mint-600 dark:text-mint-400 bg-mint-50 dark:bg-mint-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={closeAllMenus}
                >
                  <span className="flex items-center space-x-2">
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </span>
                </Link>

                <Link
                  to="/my-courses"
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === '/my-courses'
                      ? 'text-mint-600 dark:text-mint-400 bg-mint-50 dark:bg-mint-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={closeAllMenus}
                >
                  <span className="flex items-center space-x-2">
                    <Book className="w-5 h-5" />
                    <span>My Courses</span>
                  </span>
                </Link>

                <Link
                  to="/dashboard"
                  className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === '/dashboard'
                      ? 'text-mint-600 dark:text-mint-400 bg-mint-50 dark:bg-mint-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={closeAllMenus}
                >
                  <span className="flex items-center space-x-2">
                    <Layout className="w-5 h-5" />
                    <span>Dashboard</span>
                  </span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                      location.pathname === '/admin'
                        ? 'text-mint-600 dark:text-mint-400 bg-mint-50 dark:bg-mint-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={closeAllMenus}
                  >
                    <span className="flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Admin Panel</span>
                    </span>
                  </Link>
                )}
              </nav>

              <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6">
                <Link
                  to="/profile"
                  className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={closeAllMenus}
                >
                  <span className="flex items-center space-x-2">
                    <UserCircle className="w-5 h-5" />
                    <span>Profile Settings</span>
                  </span>
                </Link>

                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full mt-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 text-left"
                >
                  <span className="flex items-center space-x-2">
                    <LogOut className="w-5 h-5" />
                    <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;