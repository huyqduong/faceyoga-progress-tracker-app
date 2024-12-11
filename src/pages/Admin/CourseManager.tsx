import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';
import { useLessonStore } from '../../store/lessonStore';
import toast from 'react-hot-toast';
import CourseForm from '../../components/CourseForm';
import CourseCard from '../../components/CourseCard';
import type { Course } from '../../lib/supabase-types';

function CourseManager() {
  const { 
    courses, 
    loading, 
    error, 
    fetchAllCourses, 
    createCourse, 
    updateCourse, 
    deleteCourse,
    fetchCourseSections,
    fetchSectionLessons,
    sections,
    lessons: sectionLessons
  } = useCourseStore();
  const { lessons, fetchLessons } = useLessonStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (dataLoaded) return;
      try {
        await Promise.all([
          fetchAllCourses(),
          fetchLessons()
        ]);
        setDataLoaded(true);
      } catch (err) {
        console.error('Error loading initial data:', err);
        toast.error('Failed to load data');
      }
    };
    loadData();
  }, [fetchAllCourses, fetchLessons, dataLoaded]);

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
        <h2 className="text-2xl font-semibold text-gray-900">Course Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
          disabled={isEditing}
        >
          <Plus className="w-5 h-5 inline-block mr-2" />
          New Course
        </button>
      </header>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {selectedCourse ? 'Edit Course' : 'New Course'}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedCourse(null);
                }}
                className="text-gray-500 hover:text-gray-700"
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
          <CourseCard
            key={course.id}
            course={course}
            onEdit={() => handleEditCourse(course)}
            onDelete={() => handleDeleteCourse(course.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default CourseManager;