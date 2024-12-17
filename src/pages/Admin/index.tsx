import React from 'react';
import { Link, Outlet, useLocation, Routes, Route } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Book, 
  GraduationCap, 
  Settings, 
  Users,
  MessageSquare,
  CreditCard,
  Home,
  Bullseye
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import LessonManager from './LessonManager';
import CourseManager from './CourseManager';
import UserManager from './UserManager';
import AdminGoals from './AdminGoals';
import FeedbackManager from './FeedbackManager';
import SettingsManager from './SettingsManager';

const Admin = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  console.log('Admin component rendered, currentPath:', currentPath);

  const sidebarItems = [
    {
      name: 'Back to Home',
      href: '/',
      icon: Home
    },
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
      name: 'Goals Management',
      href: '/admin/goals',
      icon: Bullseye
    },
    {
      name: 'Feedback Management',
      href: '/admin/feedback',
      icon: MessageSquare
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings
    }
  ];

  console.log('Sidebar items:', sidebarItems);

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <aside className="w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <nav className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Panel</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2">
              {sidebarItems.map((item) => {
                const isActive = currentPath === item.href || 
                               (item.href !== '/admin' && currentPath.startsWith(item.href));
                console.log('Rendering item:', item.name, 'isActive:', isActive);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-4 py-2 my-1 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}
                    `}
                  >
                    <item.icon className={`
                      h-5 w-5 mr-3
                      ${isActive 
                        ? 'text-gray-500 dark:text-gray-300' 
                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'}
                    `} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="p-6">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="lessons" element={<LessonManager />} />
            <Route path="courses" element={<CourseManager />} />
            <Route path="users" element={<UserManager />} />
            <Route path="goals" element={<AdminGoals />} />
            <Route path="feedback" element={<FeedbackManager />} />
            <Route path="settings" element={<SettingsManager />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Admin;
