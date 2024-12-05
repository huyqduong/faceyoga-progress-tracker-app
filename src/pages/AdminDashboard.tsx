import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, GraduationCap, Settings, Users } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const adminCards = [
    {
      title: 'Exercise Management',
      description: 'Manage face yoga exercises and routines',
      icon: Dumbbell,
      path: '/admin/exercises',
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
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
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
              className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-gray-600">{card.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
