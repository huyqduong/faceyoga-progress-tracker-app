import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, GraduationCap, Settings, Users } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const adminCards = [
    {
      title: 'Lesson Management',
      description: 'Manage face yoga lessons and routines',
      icon: Dumbbell,
      path: '/admin/lessons',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Course Management',
      description: 'Create and manage training courses',
      icon: GraduationCap,
      path: '/admin/courses',
      color: 'bg-mint-100 text-mint-600',
    },
    {
      title: 'Website Settings',
      description: 'Configure website appearance and features',
      icon: Settings,
      path: '/admin/settings',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: Users,
      path: '/admin/users',
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your face yoga platform's content and settings
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                onClick={() => navigate(card.path)}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${card.color} ${
                    card.color.includes('mint') ? 'dark:bg-mint-900/30 dark:text-mint-400' : 
                    card.color.includes('purple') ? 'dark:bg-purple-900/30 dark:text-purple-400' :
                    card.color.includes('blue') ? 'dark:bg-blue-900/30 dark:text-blue-400' :
                    'dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">{card.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
