import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, BookOpen, AlertCircle, Lock } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import { CoursePurchaseButton } from '../components/CoursePurchaseButton';
import { useAuthStore } from '../store/authStore';
import { courseApi } from '../lib/courses';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !courseId) {
        setHasAccess(false);
        return;
      }
      try {
        const access = await courseApi.hasAccessToCourse(user.id, courseId);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking course access:', error);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [user, courseId]);

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

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center text-red-500 space-x-2">
          <AlertCircle className="w-5 h-5" />
          <p>Error loading course details</p>
        </div>
      </div>
    );
  }

  if (isLoading || storeLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center text-gray-500 space-x-2">
          <AlertCircle className="w-5 h-5" />
          <p>Course not found</p>
        </div>
      </div>
    );
  }

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

  const welcomeEmbedUrl = course.welcome_video ? getEmbedUrl(course.welcome_video) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Courses
      </button>

      {/* Course header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-lg text-gray-600">{course.description}</p>

        {/* Course metadata */}
        <div className="flex flex-wrap gap-4">
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
            <span>{courseSections.length} sections</span>
          </div>
        </div>

        {/* Purchase button */}
        <div className="max-w-sm">
          <CoursePurchaseButton 
            course={course} 
            onPurchaseComplete={() => {
              // Optionally refresh the page or course data
              toast.success('Course unlocked! You can now access all content.');
            }} 
          />
        </div>
      </div>

      {/* Welcome video */}
      {welcomeEmbedUrl && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Course Introduction</h2>
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={welcomeEmbedUrl}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={() => setVideoError('Failed to load video')}
            />
          </div>
          {videoError && (
            <div className="text-red-500 text-sm">{videoError}</div>
          )}
        </div>
      )}

      {/* Course sections */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
        {courseSections.map((section, index) => (
          <div key={section.id} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Section {index + 1}: {section.title}
                </h3>
                <p className="text-gray-600">{section.description}</p>
              </div>
            </div>

            {/* Section exercises */}
            <div className="space-y-2">
              {sectionExercises[section.id]?.map((exercise, exerciseIndex) => (
                exercise.exercise && (
                  <div 
                    key={exercise.id}
                    onClick={() => handleExerciseClick(exercise.exercise_id)}
                    className={`flex items-center p-3 rounded-md transition-colors ${
                      hasAccess 
                        ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer' 
                        : 'bg-gray-100 cursor-not-allowed'
                    }`}
                  >
                    {/* Exercise image */}
                    {exercise.exercise.image_url && (
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 mr-4">
                        <img 
                          src={exercise.exercise.image_url} 
                          alt={exercise.exercise.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Exercise info */}
                    <div className="flex-grow">
                      <div className="font-medium text-gray-900">
                        {exercise.exercise.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {exercise.exercise.duration}
                      </div>
                    </div>

                    {/* Lock icon and difficulty */}
                    <div className="flex items-center gap-3 text-gray-400">
                      <span className="text-sm">{exercise.exercise.difficulty}</span>
                      {!hasAccess && <Lock className="w-4 h-4" />}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseDetails;
