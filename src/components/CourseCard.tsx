import React, { useEffect } from 'react';
import { Edit2, Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Course } from '@/lib/supabase-types';
import { cn } from '@/lib/utils';
import { useCourseStore } from '@/store/courseStore';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  isLoading?: boolean;
}

function CourseCard({ course, onEdit, onDelete, isLoading }: CourseCardProps) {
  const { sections, fetchCourseSections } = useCourseStore();
  
  useEffect(() => {
    fetchCourseSections(course.id);
  }, [course.id, fetchCourseSections]);

  const courseSections = sections[course.id] || [];
  const totalLessons = courseSections.reduce((total, section) => total + (section.lessons?.length || 0), 0);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this course?')) {
      onDelete(course.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(course);
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden",
        "border border-gray-200 hover:border-mint-500",
        "relative group",
        isLoading && "opacity-50 pointer-events-none"
      )}
    >
      {/* Course Image */}
      <div className="aspect-video w-full bg-gray-100 relative">
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-mint-50">
            <svg
              className="h-12 w-12 text-mint-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-mint-50 transition-colors"
            title="Edit course"
          >
            <Edit2 className="w-4 h-4 text-mint-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors"
            title="Delete course"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>

        {/* Course Difficulty Badge */}
        {course.difficulty && (
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
            {course.difficulty}
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {course.description || 'No description available'}
        </p>
        
        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <span>{courseSections.length} sections</span>
            <span className="mx-2">•</span>
            <span>{totalLessons} lessons</span>
            {course.duration && (
              <>
                <span className="mx-2">•</span>
                <span>{course.duration}</span>
              </>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-mint-500" />
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-500" />
        </div>
      )}
    </div>
  );
}

export default CourseCard;