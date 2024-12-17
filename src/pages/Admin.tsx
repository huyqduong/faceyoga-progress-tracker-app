import React from 'react';
import { Link, useLocation, Routes, Route } from 'react-router-dom';
import { Settings, Users, BarChart, Menu, X, Dumbbell, GraduationCap, CreditCard, Target, Home, ChevronRight, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import AdminDashboard from './Admin/Dashboard';
import CourseManager from './Admin/CourseManager';
import LessonManager from './Admin/LessonManager';
import FeedbackManager from './Admin/FeedbackManager';
import Goals from './Admin/Goals';
import UserManager from './Admin/UserManager';
import SettingsManager from './Admin/SettingsManager';

export default function Admin() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    {
      name: 'Back to Home',
      href: '/',
      icon: Home,
      current: false,
      isExternal: true,
    },
    {
      name: 'Dashboard',
      href: '/admin',
      icon: BarChart,
      current: location.pathname === '/admin',
    },
    {
      name: 'Lesson Management',
      href: '/admin/lessons',
      icon: Dumbbell,
      current: location.pathname === '/admin/lessons',
    },
    {
      name: 'Course Management',
      href: '/admin/courses',
      icon: GraduationCap,
      current: location.pathname === '/admin/courses',
    },
    {
      name: 'Goal Management',
      href: '/admin/goals',
      icon: Target,
      current: location.pathname === '/admin/goals',
    },
    {
      name: 'Feedback Management',
      href: '/admin/feedback',
      icon: MessageSquare,
      current: location.pathname === '/admin/feedback',
    },
    {
      name: 'Website Settings',
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname === '/admin/settings',
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: location.pathname === '/admin/users',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 md:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Panel</h1>
          <Link to="/" className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Home className="h-6 w-6" />
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm md:hidden pt-16">
          <nav className="px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-mint-100 dark:bg-mint-900/30 text-mint-900 dark:text-mint-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`h-5 w-5 ${
                    item.current 
                      ? 'text-mint-700 dark:text-mint-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span>{item.name}</span>
                </div>
                {item.isExternal && (
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700">
          <div className="flex h-16 flex-shrink-0 items-center justify-center px-4 bg-white/50 dark:bg-gray-800/50">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto pt-1 pb-4">
            <nav className="mt-2 flex-1 space-y-2 px-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    item.current
                      ? 'bg-mint-100 dark:bg-mint-900/30 text-mint-900 dark:text-mint-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`h-5 w-5 transition-colors ${
                      item.current 
                        ? 'text-mint-700 dark:text-mint-400' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white'
                    }`} />
                    <span>{item.name}</span>
                  </div>
                  {item.isExternal && (
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <main className="py-16 md:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="lessons" element={<LessonManager />} />
              <Route path="courses" element={<CourseManager />} />
              <Route path="feedback" element={<FeedbackManager />} />
              <Route path="goals" element={<Goals />} />
              <Route path="users" element={<UserManager />} />
              <Route path="settings" element={<SettingsManager />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
