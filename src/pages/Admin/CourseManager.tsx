import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCourseStore } from '@/store/courseStore';
import { useLessonStore } from '@/store/lessonStore';
import CourseForm from '@/components/CourseForm';
import CourseCard from '@/components/CourseCard';
import type { Course } from '@/lib/supabase-types';

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
    sections,
    clearError,
    isLoadingCourse
  } = useCourseStore();

  const { 
    lessons, 
    loading: lessonsLoading, 
    error: lessonsError, 
    ensureLessonsLoaded 
  } = useLessonStore();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Combined loading state
  const loading = coursesLoading || lessonsLoading;
  // Combined error state
  const error = coursesError || lessonsError;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        clearError();
        await Promise.all([
          fetchAllCourses(),
          ensureLessonsLoaded()
        ]);
      } catch (err) {
        console.error('[CourseManager] Error loading initial data:', err);
        toast.error('Failed to load data. Please try refreshing the page.');
      }
    };

    loadData();
  }, [fetchAllCourses, clearError, ensureLessonsLoaded]);

  const handleEditCourse = async (course: Course) => {
    try {
      console.info(`[CourseManager] Starting edit for course: ${course.id}`, { courseId: course.id });
      
      if (isLoadingCourse(course.id)) {
        console.warn(`[CourseManager] Skipping edit - Already loading course ${course.id}`);
        return;
      }

      setIsLoadingDetails(true);
      setSelectedCourse(course);
      setIsEditing(true);
      
      await fetchCourseSections(course.id);
    } catch (err) {
      console.error(`[CourseManager] Error editing course ${course.id}:`, err);
      toast.error('Failed to load course details. Please try again.');
      setIsEditing(false);
      setSelectedCourse(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCreateCourse = async () => {
    setSelectedCourse(null);
    setIsEditing(true);
  };

  const handleUpdateCourse = async (courseData: Partial<Course>) => {
    if (!selectedCourse) return;
    
    try {
      await updateCourse(selectedCourse.id, courseData);
      toast.success('Course updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error(`[CourseManager] Error updating course ${selectedCourse.id}:`, err);
      toast.error('Failed to update course');
      throw err;
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      toast.success('Course deleted successfully');
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(`[CourseManager] Error deleting course ${courseId}:`, err);
      toast.error('Failed to delete course');
    }
  };

  if (isEditing) {
    return (
      <CourseForm
        initialData={selectedCourse || undefined}
        sections={selectedCourse ? sections[selectedCourse.id] : []}
        onSubmit={selectedCourse ? handleUpdateCourse : createCourse}
        onCancel={() => setIsEditing(false)}
        isSubmitting={isLoadingDetails}
        loading={loading}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600 mt-1">Create and manage your yoga courses</p>
          </div>
          <button
            onClick={handleCreateCourse}
            className="inline-flex items-center px-4 py-2 bg-mint-600 text-white rounded-lg hover:bg-mint-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-500 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Course
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 h-48"></div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
            <div className="mt-6">
              <button
                onClick={handleCreateCourse}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-mint-600 hover:bg-mint-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-500"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Course
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={() => handleEditCourse(course)}
                onDelete={() => handleDeleteCourse(course.id)}
                isLoading={isLoadingCourse(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseManager;