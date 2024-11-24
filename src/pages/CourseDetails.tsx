import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, BookOpen, AlertCircle } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import toast from 'react-hot-toast';

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { 
    courses, 
    sections, 
    exercises: sectionExercises,
    loading: storeLoading,
    error,
    fetchCourses,
    fetchCourseSections,
    fetchSectionExercises
  } = useCourseStore();

  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) return;
      
      if (dataLoaded) return; // Prevent reloading if data is already loaded
      
      setIsLoading(true);
      try {
        // Load data in sequence to ensure dependencies are met
        if (courses.length === 0) {
          await fetchCourses();
        }

        // Fetch sections for this course
        await fetchCourseSections(courseId);
        
        // Get sections after they're loaded
        const courseSections = sections[courseId] || [];
        
        // Fetch exercises for all sections
        const exercisePromises = courseSections.map(section => {
          // Only fetch if we don't already have the exercises
          if (!sectionExercises[section.id]) {
            return fetchSectionExercises(section.id);
          }
          return Promise.resolve();
        });
        
        // Wait for ALL exercises to be loaded
        await Promise.all(exercisePromises);
        
        setDataLoaded(true);
      } catch (err) {
        console.error('Error loading course data:', err);
        toast.error('Failed to load course details');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [courseId, courses.length, fetchCourses, fetchCourseSections, fetchSectionExercises, sections, sectionExercises, dataLoaded]);

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    try {
      if (url.includes('vimeo.com')) {
        let videoId = '';
        if (url.includes('player.vimeo.com/video/')) {
          videoId = url.split('player.vimeo.com/video/')[1]?.split('?')[0] || '';
        } else {
          videoId = url.split('vimeo.com/')[1]?.split('?')[0] || '';
        }
        
        if (!videoId) {
          throw new Error('Invalid Vimeo URL');
        }
        
        return `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0&dnt=1`;
      }
      
      let videoId = '';
      const urlObj = new URL(url);
      
      if (url.includes('youtube.com/watch')) {
        videoId = urlObj.searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
      } else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0] || '';
      }

      if (!videoId && url.trim().length === 11) {
        videoId = url.trim();
      }

      if (!videoId) {
        throw new Error('Invalid video URL');
      }

      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
    } catch (error) {
      setVideoError('Invalid video URL. Please check the URL and try again.');
      return null;
    }
  };

  if (!courseId) {
    return <div>Course not found</div>;
  }

  const course = courses.find(c => c.id === courseId);
  const courseSections = sections[courseId] || [];

  if (isLoading || storeLoading) {
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

  const welcomeEmbedUrl = course.welcome_video ? getEmbedUrl(course.welcome_video) : null;

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

          {/* Welcome Video */}
          {welcomeEmbedUrl && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Welcome Video</h2>
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden bg-gray-100">
                <iframe
                  src={welcomeEmbedUrl}
                  title={`${course.title} welcome video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  frameBorder="0"
                />
              </div>
            </div>
          )}

          {videoError && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <p>{videoError}</p>
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
