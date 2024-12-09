import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Settings, Users, BarChart, FileText, Menu, X, Dumbbell, GraduationCap, CreditCard, Target } from 'lucide-react';
import { useState } from 'react';

export default function Admin() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
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
    {
      name: 'Test Payment',
      href: '/admin/test-payment',
      icon: CreditCard,
      current: location.pathname === '/admin/test-payment',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-mint-100">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-mint-100 md:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg text-mint-600 hover:bg-mint-100"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <h1 className="text-lg font-semibold text-mint-900">Admin Panel</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm md:hidden pt-16">
          <nav className="px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-mint-100 text-mint-900'
                    : 'text-mint-600 hover:bg-mint-50 hover:text-mint-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white/80 backdrop-blur-sm border-r border-mint-100">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-mint-900">Admin Panel</h1>
            </div>
            <nav className="mt-8 flex-1 space-y-2 px-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-mint-100 text-mint-900'
                      : 'text-mint-600 hover:bg-mint-50 hover:text-mint-900'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 pt-16 md:pt-0">
          <div className="py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
