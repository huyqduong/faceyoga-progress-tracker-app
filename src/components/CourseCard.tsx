import React, { useState } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Course } from '../lib/supabase-types';
import SectionManager from './SectionManager';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {course.image_url && (
              <img
                src={course.image_url}
                alt={course.title}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
              <p className="text-gray-600 mt-1">{course.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{course.difficulty}</span>
                <span>{course.duration}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(course)}
              className="p-2 text-mint-600 hover:text-mint-700"
              title="Edit course details"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(course.id)}
              className="p-2 text-red-600 hover:text-red-700"
              title="Delete course"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-600 hover:text-gray-700"
              title={isExpanded ? "Hide sections" : "Show sections"}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 border-t pt-6">
            <SectionManager courseId={course.id} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseCard;