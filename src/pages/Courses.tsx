import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Filter } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import { useAuth } from '../hooks/useAuth';
import { courseApi } from '../lib/courses';
import PublicCourseCard from '../components/PublicCourseCard';
import type { Course } from '../lib/supabase-types';

type AccessFilter = 'all' | 'free' | 'owned' | 'premium';

function Courses() {
  const navigate = useNavigate();
  const { courses, loading, error, fetchCourses } = useCourseStore();
  const { user } = useAuth();
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
  const [courseAccess, setCourseAccess] = useState<Record<string, boolean>>({});
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const checkCoursesAccess = async () => {
      if (!user || courses.length === 0) {
        setCheckingAccess(false);
        return;
      }

      const access: Record<string, boolean> = {};
      for (const course of courses) {
        access[course.id] = await courseApi.hasAccessToCourse(user.id, course.id);
      }
      setCourseAccess(access);
      setCheckingAccess(false);
    };

    checkCoursesAccess();
  }, [user, courses]);

  const filteredCourses = courses.filter(course => {
    if (accessFilter === 'all') return true;
    if (accessFilter === 'free') return course.price === 0;
    if (accessFilter === 'owned') return courseAccess[course.id];
    if (accessFilter === 'premium') return course.price > 0;
    return true;
  });

  if (loading || checkingAccess) {
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2">
            <button
              onClick={() => setAccessFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                accessFilter === 'all'
                  ? 'bg-mint-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setAccessFilter('free')}
              className={`px-3 py-1 rounded-full text-sm ${
                accessFilter === 'free'
                  ? 'bg-mint-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Free
            </button>
            {user && (
              <button
                onClick={() => setAccessFilter('owned')}
                className={`px-3 py-1 rounded-full text-sm ${
                  accessFilter === 'owned'
                    ? 'bg-mint-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Owned
              </button>
            )}
            <button
              onClick={() => setAccessFilter('premium')}
              className={`px-3 py-1 rounded-full text-sm ${
                accessFilter === 'premium'
                  ? 'bg-mint-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Premium
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {filteredCourses.length} courses found
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCourses.map((course) => (
          <PublicCourseCard
            key={course.id}
            course={course}
            hasAccess={!!courseAccess[course.id]}
            price={course.price || 0}
            onClick={() => navigate(`/courses/${course.id}`)}
          />
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