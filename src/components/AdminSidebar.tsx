import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Book, 
  GraduationCap, 
  Settings, 
  Users,
  Target,
  MessageSquare,
  CreditCard
} from 'lucide-react';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'Lesson Management',
    href: '/admin/lessons',
    icon: Book
  },
  {
    name: 'Course Management',
    href: '/admin/courses',
    icon: GraduationCap
  },
  {
    name: 'Goal Management',
    href: '/admin/goals',
    icon: Target
  },
  {
    name: 'Feedback Management',
    href: '/admin/feedback',
    icon: MessageSquare
  },
  {
    name: 'Website Settings',
    href: '/admin/settings',
    icon: Settings
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users
  },
  {
    name: 'Test Payment',
    href: '/admin/test-payment',
    icon: CreditCard
  }
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Panel</h1>
      </div>
      <nav className="mt-5 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/admin' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md
                  ${isActive 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}
                `}
              >
                <item.icon
                  className={`
                    mr-3 h-5 w-5
                    ${isActive 
                      ? 'text-gray-500 dark:text-gray-300' 
                      : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'}
                  `}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
