import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';
import { useLessonStore } from '../../store/lessonStore';
import toast from 'react-hot-toast';
import CourseForm from '../../components/CourseForm';
import CourseCard from '../../components/CourseCard';
import type { Course } from '../../lib/supabase-types';

function CourseManager() {
  const { 
    courses, 
    loading: coursesLoading, 
    error: coursesError, 
    fetchAllCourses, 
    createCourse, 
    updateCourse, 
    deleteCourse,
    fetchCourseSections,
    fetchSectionLessons,
    sections,
    lessons: sectionLessons,
    clearError
  } = useCourseStore();
  const { lessons, fetchLessons, loading: lessonsLoading, error: lessonsError } = useLessonStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Combined loading state
  const loading = coursesLoading || lessonsLoading;
  // Combined error state
  const error = coursesError || lessonsError;

  useEffect(() => {
    const loadData = async () => {
      try {
        clearError(); // Clear any previous errors
        await Promise.all([
          fetchAllCourses(),
          fetchLessons()
        ]);
      } catch (err) {
        console.error('Error loading initial data:', err);
        toast.error('Failed to load data. Please try refreshing the page.');
      }
    };
    loadData();
  }, [fetchAllCourses, fetchLessons, clearError]);

  const handleCreateCourse = async (data: any) => {
    try {
      await createCourse(data);
      toast.success('Course created successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error creating course:', err);
      toast.error('Failed to create course');
    }
  };

  const handleUpdateCourse = async (id: string, data: any) => {
    try {
      await updateCourse(id, data);
      toast.success('Course updated successfully');
      setIsEditing(false);
      setSelectedCourse(null);
    } catch (err) {
      console.error('Error updating course:', err);
      toast.error('Failed to update course');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }
    try {
      await deleteCourse(id);
      toast.success('Course deleted successfully');
    } catch (err) {
      console.error('Error deleting course:', err);
      toast.error('Failed to delete course');
    }
  };

  const handleEditCourse = async (course: Course) => {
    setSelectedCourse(course);
    setIsEditing(true);
    setIsLoadingDetails(true);
    try {
      await Promise.all([
        fetchCourseSections(course.id),
        fetchSectionLessons(course.id)
      ]);
    } catch (err) {
      console.error('Error loading course details:', err);
      toast.error('Failed to load course details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchAllCourses()}
          className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Course Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-mint-500 hover:bg-mint-600 dark:bg-mint-600 dark:hover:bg-mint-700 text-white rounded-lg transition-colors"
          disabled={isEditing}
        >
          <Plus className="w-5 h-5 inline-block mr-2" />
          New Course
        </button>
      </header>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedCourse ? 'Edit Course' : 'New Course'}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedCourse(null);
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <CourseForm
              course={selectedCourse}
              onSubmit={selectedCourse ? handleUpdateCourse : handleCreateCourse}
              sections={sections[selectedCourse?.id || '']}
              sectionLessons={sectionLessons}
              allLessons={lessons}
              loading={isLoadingDetails}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={course.image_url || '/placeholder-course.jpg'}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {course.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mint-100 dark:bg-mint-900/30 text-mint-800 dark:text-mint-300">
                  {course.level}
                </span>
                {course.is_premium && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                    Premium
                  </span>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => handleEditCourse(course)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-mint-600 dark:hover:text-mint-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseManager;