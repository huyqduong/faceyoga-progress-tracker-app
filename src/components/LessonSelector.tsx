import React from 'react';
import { useLessonStore } from '../store/lessonStore';

interface LessonSelectorProps {
  selectedLessons: string[];
  onChange: (lessons: string[]) => void;
}

function LessonSelector({ selectedLessons, onChange }: LessonSelectorProps) {
  const { lessons, loading } = useLessonStore();

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
        {loading ? (
          <p className="text-center text-gray-500 py-2">Loading lessons...</p>
        ) : lessons.length === 0 ? (
          <p className="text-center text-gray-500 py-2">
            No lessons available. Create some lessons first.
          </p>
        ) : (
          lessons.map((lesson) => (
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
                {lesson.image_url ? (
                  <img
                    src={lesson.image_url}
                    alt={lesson.title}
                    className="w-10 h-10 rounded object-cover bg-gray-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {lesson.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-md">
                    {lesson.description}
                  </div>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {lesson.duration} min
                </div>
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

export default LessonSelector;