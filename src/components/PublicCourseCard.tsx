import React from 'react';
import { Clock, Target, Lock, Check, Star } from 'lucide-react';
import type { Course } from '../lib/supabase-types';

interface PublicCourseCardProps {
  course: Course;
  hasAccess: boolean;
  price?: number;
  onClick: () => void;
}

function PublicCourseCard({ course, hasAccess, price = 0, onClick }: PublicCourseCardProps) {
  const isFree = price === 0;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer ${
        hasAccess ? 'border-2 border-mint-500 dark:border-mint-400' : 'border border-gray-100 dark:border-gray-700'
      }`}
    >
      <div className="relative">
        {course.image_url && (
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isFree ? 'bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
          }`}>
            {isFree ? 'Free' : `$${price}`}
          </span>
          {hasAccess && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-mint-100 dark:bg-mint-900/30 text-mint-700 dark:text-mint-300 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Owned
            </span>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            {course.title}
            {!isFree && !hasAccess && <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{course.description}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{course.level}</span>
          </div>
          {course.rating && (
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{course.rating}</span>
            </div>
          )}
        </div>

        {/* Progress bar for owned courses */}
        {hasAccess && course.progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-mint-500 dark:bg-mint-400 h-2 rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicCourseCard;
