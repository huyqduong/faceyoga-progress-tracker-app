import React, { useEffect } from 'react';
import { useLessonStore } from '../store/lessonStore';

interface LessonSelectorProps {
  selectedLessons: string[];
  onChange: (lessons: string[]) => void;
}

function LessonSelector({ selectedLessons, onChange }: LessonSelectorProps) {
  const { lessons, fetchLessons } = useLessonStore();

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleToggleLesson = (lessonId: string) => {
    const newSelection = selectedLessons.includes(lessonId)
      ? selectedLessons.filter(id => id !== lessonId)
      : [...selectedLessons, lessonId];
    onChange(newSelection);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Lessons ({selectedLessons.length} selected)
      </label>
      <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-lg bg-white">
        {lessons.map((lesson) => (
          <label
            key={lesson.id}
            className={`flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer ${
              selectedLessons.includes(lesson.id) ? 'bg-mint-50' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={selectedLessons.includes(lesson.id)}
              onChange={() => handleToggleLesson(lesson.id)}
              className="rounded border-gray-300 text-mint-600 focus:ring-mint-500"
            />
            <div className="flex items-center space-x-3 flex-1">
              <img
                src={lesson.thumbnail_url}
                alt={lesson.title}
                className="w-10 h-10 rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{lesson.title}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{lesson.duration}</span>
                  <span>•</span>
                  <span>{lesson.difficulty}</span>
                </div>
              </div>
            </div>
          </label>
        ))}

        {lessons.length === 0 && (
          <p className="text-center text-gray-500 py-2">
            No lessons available. Create some lessons first.
          </p>
        )}
      </div>
    </div>
  );
}

export default LessonSelector;