import React, { useState, useEffect } from 'react';
import { useCourseStore } from '../store/courseStore';
import toast from 'react-hot-toast';

interface SectionManagerProps {
  courseId: string;
}

function SectionManager({ courseId }: SectionManagerProps) {
  const { 
    sections,
    exercises: sectionExercises,
    loading,
    error,
    fetchCourseSections,
    fetchSectionExercises
  } = useCourseStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSectionData = async () => {
      try {
        setIsLoading(true);
        // First fetch sections
        await fetchCourseSections(courseId);
        const courseSections = sections[courseId] || [];
        
        // Then fetch exercises for each section
        await Promise.all(
          courseSections.map(section => fetchSectionExercises(section.id))
        );
      } catch (err) {
        console.error('Error loading section data:', err);
        toast.error('Failed to load sections');
      } finally {
        setIsLoading(false);
      }
    };

    loadSectionData();
  }, [courseId, fetchCourseSections, fetchSectionExercises]);

  const courseSections = sections[courseId] || [];

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading sections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  if (courseSections.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        No sections in this course.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {courseSections.map((section) => {
        const exercises = sectionExercises[section.id] || [];
        
        return (
          <div key={section.id} className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div>
              <h5 className="font-medium text-gray-900">{section.title}</h5>
              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            </div>

            {exercises.length > 0 && (
              <div className="border-t pt-4">
                <h6 className="text-sm font-medium text-gray-700 mb-3">
                  Exercises ({exercises.length}):
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exercises.map((exerciseData) => (
                    <div
                      key={exerciseData.id}
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-100"
                    >
                      {exerciseData.exercise && (
                        <>
                          <img
                            src={exerciseData.exercise.image_url}
                            alt={exerciseData.exercise.title}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {exerciseData.exercise.title}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{exerciseData.exercise.duration}</span>
                              <span>•</span>
                              <span>{exerciseData.exercise.difficulty}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SectionManager;