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
      className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer ${
        hasAccess ? 'border-2 border-mint-500' : 'border border-gray-100'
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
            isFree ? 'bg-mint-100 text-mint-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {isFree ? 'Free' : `$${price}`}
          </span>
          {hasAccess && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-mint-100 text-mint-700 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Owned
            </span>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            {course.title}
            {!isFree && !hasAccess && <Lock className="w-4 h-4 text-gray-400" />}
          </h3>
          <p className="text-gray-600 line-clamp-2 text-sm sm:text-base">
            {course.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {course.duration}
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-1" />
            {course.difficulty}
          </div>
          {course.rating && (
            <div className="flex items-center text-yellow-500">
              <Star className="w-4 h-4 mr-1 fill-current" />
              {course.rating}
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${
            hasAccess
              ? 'bg-mint-500 text-white hover:bg-mint-600'
              : isFree
              ? 'bg-mint-500 text-white hover:bg-mint-600'
              : 'bg-yellow-500 text-white hover:bg-yellow-600'
          } transition-colors`}
        >
          {hasAccess ? (
            <>
              <span>Continue Learning</span>
            </>
          ) : isFree ? (
            <>
              <span>Start Learning</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Purchase Course</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default PublicCourseCard;
