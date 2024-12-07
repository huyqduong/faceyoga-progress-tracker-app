import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, BookOpen, AlertCircle, Lock, ArrowRight } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import { CoursePurchaseButton } from '../components/CoursePurchaseButton';
import { useAuthStore } from '../store/authStore';
import { courseApi } from '../lib/courses';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
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
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  // Get course data
  const course = courses.find(c => c.id === courseId);
  const courseSections = sections[courseId] || [];

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
        await Promise.all(courseSections.map(section => 
          fetchSectionExercises(section.id)
        ));

        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading course data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [courseId, courses.length, dataLoaded, fetchCourses, fetchCourseSections, fetchSectionExercises, sections]);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !courseId) {
        setHasAccess(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('course_access')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        setHasAccess(data && data.length > 0);
      } catch (error) {
        console.error('Error checking course access:', error);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [user?.id, courseId]);

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    try {
      const videoUrl = new URL(url);
      
      // Handle YouTube URLs
      if (videoUrl.hostname.includes('youtube.com') || videoUrl.hostname.includes('youtu.be')) {
        const videoId = videoUrl.hostname.includes('youtu.be')
          ? videoUrl.pathname.slice(1)
          : new URLSearchParams(videoUrl.search).get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      
      // Handle Vimeo URLs
      if (videoUrl.hostname.includes('vimeo.com')) {
        const videoId = videoUrl.pathname.split('/').pop();
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}`;
        }
      }

      return url;
    } catch (error) {
      console.error('Invalid URL:', error);
      setVideoError('Invalid video URL format');
      return null;
    }
  };

  const handleExerciseClick = async (exerciseId: string) => {
    if (!user) {
      toast.error('Please sign in to access exercises');
      return;
    }
    
    if (!hasAccess) {
      toast.error('Please purchase this course to access exercises');
      return;
    }

    navigate(`/exercises/${exerciseId}`, { state: { fromCourse: courseId } });
  };

  const handlePurchaseComplete = () => {
    setHasAccess(true);
    // Force a refresh of courses data when navigating back
    navigate('/courses', { state: { refreshAccess: true } });
  };

  // Show loading state while fetching data
  if (isLoading || storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500"></div>
      </div>
    );
  }

  // Show error state if course not found
  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/courses')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mint-600 hover:bg-mint-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const welcomeEmbedUrl = course.welcome_video ? getEmbedUrl(course.welcome_video) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/courses')}
        className="inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Courses
      </button>

      {/* Course header */}
      <div className="space-y-6">
        {/* Course image */}
        <div className="relative max-h-[400px] h-[40vh] rounded-lg overflow-hidden">
          {course.image_url ? (
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-lg text-gray-600">{course.description}</p>

          {/* Course stats */}
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>{course.duration} minutes</span>
            </div>
            <div className="flex items-center">
              <Target className="mr-2 h-4 w-4" />
              <span>{course.level}</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              <span>{courseSections.length} sections</span>
            </div>
          </div>

          {/* Welcome video */}
          {welcomeEmbedUrl && (
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={welcomeEmbedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg shadow-lg"
                onError={() => setVideoError('Failed to load video')}
              />
            </div>
          )}
          {videoError && (
            <div className="text-red-500 flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              {videoError}
            </div>
          )}

          {/* Purchase button */}
          <div className="max-w-sm">
            <CoursePurchaseButton 
              course={course} 
              onPurchaseComplete={handlePurchaseComplete}
            />
          </div>
        </div>
      </div>

      {/* Course content */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
        {!hasAccess && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center text-gray-600">
            <Lock className="mr-2 h-4 w-4" />
            Purchase this course to access all content
          </div>
        )}
        <div className="space-y-4">
          {courseSections.map((section, index) => (
            <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Section {index + 1}: {section.title}
                </h3>
                {section.description && (
                  <p className="mt-1 text-sm text-gray-500">{section.description}</p>
                )}
              </div>
              <div className="divide-y divide-gray-200">
                {sectionExercises[section.id]?.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => handleExerciseClick(exercise.exercise_id)}
                    className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors
                      ${hasAccess 
                        ? 'hover:bg-gray-50 cursor-pointer' 
                        : 'cursor-not-allowed text-gray-400'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      {exercise.exercise?.image_url && (
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={exercise.exercise.image_url}
                            alt={exercise.exercise.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{exercise.exercise?.title}</div>
                        <div className="text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {exercise.exercise?.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!hasAccess ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-mint-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
