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
      {/* Target Area Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Target className="w-4 h-4" />
          <span>Target Area</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange('all')}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200
              ${
                selectedCategory === 'all'
                  ? 'bg-mint-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200
                ${
                  selectedCategory === category
                    ? 'bg-mint-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Access Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>Access</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAccessFilterChange('all')}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200
              ${
                accessFilter === 'all'
                  ? 'bg-mint-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            All
          </button>
          <button
            onClick={() => onAccessFilterChange('free')}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200
              ${
                accessFilter === 'free'
                  ? 'bg-mint-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            Free
          </button>
          <button
            onClick={() => onAccessFilterChange('premium')}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200
              ${
                accessFilter === 'premium'
                  ? 'bg-mint-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            Premium
          </button>
        </div>
      </div>
    </div>
  );
}

export default LessonFilter;