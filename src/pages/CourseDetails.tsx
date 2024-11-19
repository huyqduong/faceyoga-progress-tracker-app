import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, BookOpen } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import toast from 'react-hot-toast';

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { 
    courses, 
    sections, 
    exercises: sectionExercises,
    loading,
    error,
    fetchCourses,
    fetchCourseSections,
    fetchSectionExercises
  } = useCourseStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) return;
      
      setIsLoading(true);
      try {
        // Load data in sequence to ensure dependencies are met
        if (courses.length === 0) {
          await fetchCourses();
        }

        // Fetch sections for this course
        const sectionsData = await fetchCourseSections(courseId);
        
        // Wait for sections to be loaded before fetching exercises
        const courseSections = sections[courseId] || [];
        
        // Fetch exercises for all sections in parallel
        await Promise.all(
          courseSections.map(section => fetchSectionExercises(section.id))
        );
      } catch (err) {
        console.error('Error loading course data:', err);
        toast.error('Failed to load course details');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]); // Remove dependencies that cause re-runs

  if (!courseId) {
    return <div>Course not found</div>;
  }

  const course = courses.find(c => c.id === courseId);
  const courseSections = sections[courseId] || [];

  if (isLoading || loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Course not found</p>
      </div>
    );
  }

  const handleExerciseClick = (exerciseId: string) => {
    navigate(`/exercises/${exerciseId}`, { state: { fromCourse: courseId } });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 w-10 h-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{course.title}</h1>
      </div>

      {/* Course Overview */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 space-y-6">
          {course.image_url && (
            <div className="aspect-w-16 aspect-h-9 sm:aspect-h-7 rounded-lg overflow-hidden">
              <img
                src={course.image_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Target className="w-5 h-5 mr-2" />
              <span>{course.difficulty}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <BookOpen className="w-5 h-5 mr-2" />
              <span>{courseSections.length} Sections</span>
            </div>
          </div>

          <p className="text-gray-600">{course.description}</p>

          {/* Course Content */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Course Content</h2>
            
            {courseSections.map((section, index) => {
              const exercises = sectionExercises[section.id] || [];
              
              return (
                <div key={section.id} className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Section {index + 1}: {section.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{section.description}</p>

                  {exercises.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Exercises in this section:
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {exercises.map((exerciseData) => (
                          exerciseData.exercise && (
                            <div
                              key={exerciseData.id}
                              onClick={() => handleExerciseClick(exerciseData.exercise_id)}
                              className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                            >
                              <img
                                src={exerciseData.exercise.image_url}
                                alt={exerciseData.exercise.title}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h5 className="font-medium text-gray-900 truncate">
                                  {exerciseData.exercise.title}
                                </h5>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <span className="truncate">{exerciseData.exercise.duration}</span>
                                  <span>•</span>
                                  <span className="truncate">{exerciseData.exercise.difficulty}</span>
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {courseSections.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No sections available for this course.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;