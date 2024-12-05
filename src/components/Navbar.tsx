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
  Layout
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSettingsStore } from '../store/settingsStore';
import { signOut } from '../lib/auth';
import toast from 'react-hot-toast';

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
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-mint-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Business Name */}
          <Link to="/" className="flex-shrink-0 flex items-center space-x-3">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.business_name}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center bg-mint-50 rounded-lg">
                <Sparkles className="w-6 h-6 text-mint-500" />
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {settings?.business_name || 'Face Yoga'}
              </h1>
              <p className="text-sm text-gray-500 leading-tight">
                {settings?.tagline || 'Transform Your Face Naturally'}
              </p>
            </div>
            {/* Mobile Business Name */}
            <h1 className="sm:hidden text-lg font-bold text-gray-900">
              {settings?.business_name?.split(' ').map(word => word[0]).join('') || 'FY'}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${location.pathname === '/'
                  ? 'text-mint-600 bg-mint-50'
                  : 'text-gray-600 hover:text-mint-600 hover:bg-mint-50'
                }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${location.pathname === '/dashboard'
                  ? 'text-mint-600 bg-mint-50'
                  : 'text-gray-600 hover:text-mint-600 hover:bg-mint-50'
                }`}
            >
              <Layout className="w-4 h-4" />
              <span>My Courses</span>
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${location.pathname === '/admin'
                      ? 'text-mint-600 bg-mint-50'
                      : 'text-gray-600 hover:text-mint-600 hover:bg-mint-50'
                    }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
                <Link
                  to="/test-payment"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${location.pathname === '/test-payment'
                      ? 'text-mint-600 bg-mint-50'
                      : 'text-gray-600 hover:text-mint-600 hover:bg-mint-50'
                    }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Test Payment</span>
                </Link>
              </>
            )}

            {/* Desktop Profile Menu */}
            <div className="relative ml-2">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-mint-50"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-mint-100 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-mint-600" />
                  </div>
                )}
                <span className="text-gray-700 hidden xl:inline">{profile?.full_name || 'Profile'}</span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-mint-50"
                    onClick={closeAllMenus}
                  >
                    <UserCircle className="w-4 h-4 inline-block mr-2" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
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
          <div className="md:hidden border-t border-mint-100 py-2">
            <div className="space-y-1">
              {/* Mobile Profile Info */}
              <div className="px-4 py-3 border-b border-mint-100">
                <div className="flex items-center space-x-3">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Profile'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center">
                      <UserCircle className="w-8 h-8 text-mint-600" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {profile?.full_name || 'User'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {profile?.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-mint-100 mt-2 pt-2 px-2">
                <Link
                  to="/"
                  className="block px-4 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-mint-50"
                  onClick={closeAllMenus}
                >
                  Home
                </Link>

                <Link
                  to="/dashboard"
                  className="block px-4 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-mint-50"
                  onClick={closeAllMenus}
                >
                  My Courses
                </Link>

                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      className="block px-4 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-mint-50"
                      onClick={closeAllMenus}
                    >
                      Admin Panel
                    </Link>
                    <Link
                      to="/test-payment"
                      className="block px-4 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-mint-50"
                      onClick={closeAllMenus}
                    >
                      Test Payment
                    </Link>
                  </>
                )}
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
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