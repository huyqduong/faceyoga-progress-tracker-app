import React, { useState, useEffect } from 'react';
import { Dumbbell, BookOpen, Settings, CreditCard } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ExerciseManager from './Admin/ExerciseManager';
import CourseManager from './Admin/CourseManager';
import SettingsManager from './Admin/SettingsManager';
import AppSettings from './Admin/AppSettings';
import { CoursePurchaseTest } from '../components/CoursePurchaseTest';

type Tab = 'exercises' | 'courses' | 'settings' | 'purchases' | 'app-settings';

function Admin() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>('exercises');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'exercises' || tab === 'courses' || tab === 'settings' || tab === 'purchases' || tab === 'app-settings')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-lg text-gray-600">
          Manage your exercises, courses, and website settings
        </p>
      </header>

      <div className="flex justify-center space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('exercises')}
          className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors
            ${activeTab === 'exercises'
              ? 'border-mint-500 text-mint-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          <Dumbbell className="w-5 h-5 mr-2" />
          Exercises
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors
            ${activeTab === 'courses'
              ? 'border-mint-500 text-mint-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Courses
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors
            ${activeTab === 'settings'
              ? 'border-mint-500 text-mint-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          <Settings className="w-5 h-5 mr-2" />
          Settings
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors
            ${activeTab === 'purchases'
              ? 'border-mint-500 text-mint-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Test Purchases
        </button>
        <button
          onClick={() => setActiveTab('app-settings')}
          className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-colors
            ${activeTab === 'app-settings'
              ? 'border-mint-500 text-mint-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
          <Settings className="w-5 h-5 mr-2" />
          App Settings
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {activeTab === 'exercises' && <ExerciseManager />}
        {activeTab === 'courses' && <CourseManager />}
        {activeTab === 'settings' && <SettingsManager />}
        {activeTab === 'purchases' && <CoursePurchaseTest />}
        {activeTab === 'app-settings' && <AppSettings />}
      </div>
    </div>
  );
}

export default Admin;
