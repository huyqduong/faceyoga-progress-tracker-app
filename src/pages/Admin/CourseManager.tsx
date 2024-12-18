import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCourseStore } from '@/store/courseStore';
import { useLessonStore } from '@/store/lessonStore';
import CourseForm from '@/components/CourseForm';
import CourseCard from '@/components/CourseCard';
import DebugPanel from '@/components/DebugPanel';
import Logger from '@/utils/logger';
import type { Course } from '@/types';

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

  // Track if initial data is loaded
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (isInitialDataLoaded) {
        Logger.debug('CourseManager', 'Initial data already loaded, skipping');
        return;
      }

      Logger.info('CourseManager', 'Starting initial data load');
      try {
        clearError();
        setIsLoadingDetails(true);
        
        Logger.debug('CourseManager', 'Loading courses and lessons in parallel');
        await Promise.all([
          fetchAllCourses(),
          ensureLessonsLoaded()
        ]);
        
        Logger.info('CourseManager', 'Initial data loaded successfully');
        setIsInitialDataLoaded(true);
      } catch (err) {
        Logger.error('CourseManager', 'Error loading initial data', err);
        toast.error('Failed to load data. Please try refreshing the page.');
      } finally {
        setIsLoadingDetails(false);
      }
    };

    loadData();
  }, [fetchAllCourses, clearError, ensureLessonsLoaded, isInitialDataLoaded]);

  const handleEditCourse = async (course: Course) => {
    Logger.info('CourseManager', `Starting edit for course: ${course.id}`, { courseId: course.id });
    
    // If already loading details for this course or initial data isn't loaded, don't proceed
    if (isLoadingCourse(course.id) || !isInitialDataLoaded) {
      Logger.warn('CourseManager', `Skipping edit - Already loading: ${isLoadingCourse(course.id)}, Initial data loaded: ${isInitialDataLoaded}`);
      return;
    }

    // If switching to a different course while loading, cancel previous loading
    if (selectedCourse?.id !== course.id) {
      Logger.info('CourseManager', `Switching from course ${selectedCourse?.id} to ${course.id}`);
      setSelectedCourse(null);
      setIsEditing(false);
    }
    
    setIsLoadingDetails(true);
    
    try {
      Logger.debug('CourseManager', `Fetching sections for course ${course.id}`);
      await fetchCourseSections(course.id);
      
      Logger.debug('CourseManager', `Setting selected course: ${course.id}`);
      setSelectedCourse(course);
      setIsEditing(true);
    } catch (err) {
      Logger.error('CourseManager', 'Error loading course details', err);
      toast.error('Failed to load course details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCreateCourse = async (data: any) => {
    Logger.info('CourseManager', 'Starting course creation', data);
    if (!isInitialDataLoaded) {
      Logger.warn('CourseManager', 'Cannot create course - initial data not loaded');
      return;
    }

    try {
      await createCourse(data);
      Logger.info('CourseManager', 'Course created successfully');
      toast.success('Course created successfully');
      setIsEditing(false);
    } catch (err) {
      Logger.error('CourseManager', 'Error creating course', err);
      toast.error('Failed to create course');
    }
  };

  const handleUpdateCourse = async (id: string, data: any) => {
    Logger.info('CourseManager', `Starting course update for: ${id}`, { courseId: id, data });
    if (!isInitialDataLoaded) {
      Logger.warn('CourseManager', 'Cannot update course - initial data not loaded');
      return;
    }

    try {
      await updateCourse(id, data);
      Logger.info('CourseManager', `Course ${id} updated successfully`);
      toast.success('Course updated successfully');
      setIsEditing(false);
      setSelectedCourse(null);
    } catch (err) {
      Logger.error('CourseManager', `Error updating course ${id}`, err);
      toast.error('Failed to update course');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    Logger.info('CourseManager', `Starting course deletion for: ${id}`);
    if (!isInitialDataLoaded) {
      Logger.warn('CourseManager', 'Cannot delete course - initial data not loaded');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this course?')) {
      Logger.debug('CourseManager', 'Course deletion cancelled by user');
      return;
    }

    try {
      await deleteCourse(id);
      Logger.info('CourseManager', `Course ${id} deleted successfully`);
      toast.success('Course deleted successfully');
    } catch (err) {
      Logger.error('CourseManager', `Error deleting course ${id}`, err);
      toast.error('Failed to delete course');
    }
  };

  if (!isInitialDataLoaded || loading) {
    Logger.debug('CourseManager', 'Showing loading state', { isInitialDataLoaded, loading });
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <button
            onClick={() => {
              Logger.debug('CourseManager', 'Starting new course creation');
              setSelectedCourse(null);
              setIsEditing(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-mint-600 hover:bg-mint-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {isEditing ? (
          <div className="bg-white shadow rounded-lg">
            <CourseForm
              initialData={selectedCourse}
              onSubmit={data => {
                Logger.debug('CourseManager', 'Submitting course form', { 
                  isEditing: !!selectedCourse, 
                  courseId: selectedCourse?.id,
                  data 
                });
                return selectedCourse 
                  ? handleUpdateCourse(selectedCourse.id, data)
                  : handleCreateCourse(data);
              }}
              onCancel={() => {
                Logger.debug('CourseManager', 'Cancelling course form');
                setIsEditing(false);
                setSelectedCourse(null);
              }}
              isSubmitting={isLoadingDetails}
              loading={isLoadingDetails}
              sections={sections[selectedCourse?.id || '']}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={() => handleEditCourse(course)}
                onDelete={() => handleDeleteCourse(course.id)}
                loading={isLoadingCourse(course.id)}
              />
            ))}
          </div>
        )}
      </div>
      <DebugPanel />
    </>
  );
}

export default CourseManager;