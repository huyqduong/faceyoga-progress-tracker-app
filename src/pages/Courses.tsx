import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Target, BookOpen } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';

function Courses() {
  const navigate = useNavigate();
  const { courses, loading, error, fetchCourses } = useCourseStore();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <header className="text-center">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">Face Yoga Courses</h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our comprehensive face yoga courses designed to help you achieve your facial fitness goals.
        </p>
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => navigate(`/courses/${course.id}`)}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer border border-gray-100"
          >
            {course.image_url && (
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {course.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">
                {course.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  {course.difficulty}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !error && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No courses available yet.</p>
        </div>
      )}
    </div>
  );
}

export default Courses;