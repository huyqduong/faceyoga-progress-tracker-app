import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';
import { useExerciseStore } from '../../store/exerciseStore';
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
    fetchSectionExercises,
    sections,
    exercises: sectionExercises
  } = useCourseStore();
  const { exercises, fetchExercises } = useExerciseStore();
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
          fetchExercises()
        ]);
        setDataLoaded(true);
      } catch (err) {
        console.error('Error loading initial data:', err);
        toast.error('Failed to load data');
      }
    };
    loadData();
  }, [fetchAllCourses, fetchExercises, dataLoaded]);

  const handleCreateCourse = async (data: any) => {
    try {
      await createCourse(data);
      toast.success('Course created successfully');
      setIsEditing(false);
      fetchAllCourses(); // Refresh the courses list
    } catch (err) {
      console.error('Create course error:', err);
      toast.error('Failed to create course');
    }
  };

  const handleUpdateCourse = async (data: any) => {
    if (!selectedCourse) return;
    try {
      await updateCourse(selectedCourse.id, {
        id: selectedCourse.id,
        ...data
      });
      toast.success('Course updated successfully');
      setIsEditing(false);
      setSelectedCourse(null);
      fetchAllCourses(); // Refresh the courses list
    } catch (err) {
      console.error('Update course error:', err);
      toast.error('Failed to update course');
    }
  };

  const handleEditCourse = async (course: Course) => {
    setIsLoadingDetails(true);
    try {
      // Only fetch if we don't already have the data
      if (!sections[course.id]) {
        await fetchCourseSections(course.id);
      }
      
      // Get the sections for this course
      const courseSections = sections[course.id] || [];
      
      // Only fetch exercises for sections we don't have
      const exercisePromises = courseSections.map(section => {
        if (!sectionExercises[section.id]) {
          return fetchSectionExercises(section.id);
        }
        return Promise.resolve();
      });
      
      await Promise.all(exercisePromises);
      
      setSelectedCourse(course);
      setIsEditing(true);
    } catch (err) {
      console.error('Error fetching course details:', err);
      toast.error('Failed to load course details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(id);
      toast.success('Course deleted successfully');
    } catch (err) {
      console.error('Delete course error:', err);
      toast.error('Failed to delete course');
    }
  };

  if (loading && !isEditing) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Course Management</h2>
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setSelectedCourse(null);
          }}
          className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
        >
          {isEditing ? (
            <>
              <X className="w-5 h-5 inline-block mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 inline-block mr-2" />
              New Course
            </>
          )}
        </button>
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          {isLoadingDetails ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading course details...</p>
            </div>
          ) : (
            <CourseForm
              initialData={selectedCourse || undefined}
              onSubmit={selectedCourse ? handleUpdateCourse : handleCreateCourse}
              onCancel={() => {
                setIsEditing(false);
                setSelectedCourse(null);
              }}
              isSubmitting={loading}
              sections={sections[selectedCourse?.id || '']}
              sectionExercises={sectionExercises}
            />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
            />
          ))}

          {courses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500">No courses yet. Click "New Course" to create one.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CourseManager;