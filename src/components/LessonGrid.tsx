import React, { useState, useEffect } from 'react';
import { Play, Lock, Clock, BarChart } from 'lucide-react';
import { Lesson } from '../types';

interface LessonGridProps {
  lessons: Lesson[];
  onStartLesson: (lesson: Lesson) => void;
  hasAccessToLesson: (lesson: Lesson) => Promise<boolean>;
}

function LessonGrid({ lessons, onStartLesson, hasAccessToLesson }: LessonGridProps) {
  const [lessonAccess, setLessonAccess] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLessonAccess({});
    setLoading({});
    lessons.forEach(async (lesson) => {
      try {
        setLoading(prev => ({ ...prev, [lesson.id]: true }));
        const hasAccess = await hasAccessToLesson(lesson);
        setLessonAccess(prev => ({ ...prev, [lesson.id]: hasAccess }));
      } catch (error) {
        console.error(`Error checking access for lesson ${lesson.id}:`, error);
        setLessonAccess(prev => ({ ...prev, [lesson.id]: false }));
      } finally {
        setLoading(prev => ({ ...prev, [lesson.id]: false }));
      }
    });
  }, [lessons, hasAccessToLesson]);

  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center">
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No lessons found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-mint-200 dark:hover:border-mint-700"
        >
          <div className="aspect-video w-full relative overflow-hidden">
            <img
              src={lesson.image_url}
              alt={lesson.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
            />
            {(!lessonAccess[lesson.id] || loading[lesson.id]) && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
                <Lock className="w-8 h-8 text-white" />
              </div>
            )}
            {lesson.is_premium && (
              <span className="absolute top-2 right-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm">
                Premium
              </span>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{lesson.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{lesson.description}</p>
            
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration} min</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart className="w-4 h-4" />
                  <span>{lesson.difficulty}</span>
                </div>
              </div>
              
              <button
                onClick={() => onStartLesson(lesson)}
                disabled={loading[lesson.id]}
                className={`
                  w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium
                  ${loading[lesson.id] 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-wait'
                    : lessonAccess[lesson.id]
                      ? 'bg-mint-500 text-white hover:bg-mint-600 shadow-sm hover:shadow'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                  transition-all duration-200
                `}
              >
                <Play className="w-4 h-4 mr-2" />
                {loading[lesson.id] 
                  ? 'Checking Access...' 
                  : lessonAccess[lesson.id] 
                    ? 'Start Lesson' 
                    : 'Unlock Lesson'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LessonGrid;