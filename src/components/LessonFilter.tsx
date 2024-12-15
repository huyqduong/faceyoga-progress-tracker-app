import React from 'react';
import { Target, Filter } from 'lucide-react';
import { useLessonStore } from '../store/lessonStore';

interface LessonFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  accessFilter: 'all' | 'free' | 'premium';
  onAccessFilterChange: (filter: 'all' | 'free' | 'premium') => void;
}

function LessonFilter({ 
  selectedCategory, 
  onCategoryChange, 
  accessFilter, 
  onAccessFilterChange 
}: LessonFilterProps) {
  const { categories } = useLessonStore();

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex flex-wrap gap-2">
        {/* Target Area Filter */}
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Area</span>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onCategoryChange('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'all'
                  ? 'bg-mint-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-mint-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Access Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Access</span>
          <div className="flex gap-1">
            <button
              onClick={() => onAccessFilterChange('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                accessFilter === 'all'
                  ? 'bg-mint-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onAccessFilterChange('free')}
              className={`px-3 py-1 rounded-full text-sm ${
                accessFilter === 'free'
                  ? 'bg-mint-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => onAccessFilterChange('premium')}
              className={`px-3 py-1 rounded-full text-sm ${
                accessFilter === 'premium'
                  ? 'bg-mint-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonFilter;