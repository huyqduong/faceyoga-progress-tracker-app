import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useLessonStore } from '../store/lessonStore';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore } from '../store/progressStore';
import { useLessonHistoryStore } from '../store/lessonHistoryStore';
import { useGoalProgressStore } from '../store/goalProgressStore';
import { courseApi } from '../lib/courses';
import toast from 'react-hot-toast';
import BackButton from '../components/BackButton';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ImageOff, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  X 
} from 'lucide-react';

interface LessonDetailsProps {
  onComplete?: () => void;
}

function LessonDetails({ onComplete }: LessonDetailsProps) {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfileStore();
  const { lessons, fetchLessons } = useLessonStore();
  const { fetchProgress } = useProgressStore();
  const { fetchHistory } = useLessonHistoryStore();
  const { trackLessonCompletion } = useGoalProgressStore();
  
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !lessonId) {
        setHasAccess(false);
        setCheckingAccess(false);
        return;
      }

      try {
        // First check if this is a standalone lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();

        if (lessonError) {
          console.error('Error fetching lesson:', lessonError);
          setHasAccess(false);
          setCheckingAccess(false);
          return;
        }

        if (lessonData) {
          // If it's a standalone lesson, grant access
          setHasAccess(true);
          setCheckingAccess(false);
          return;
        }

        // If not found as standalone, check course access
        const access = await courseApi.hasAccessToLesson(user.id, lessonId);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking lesson access:', error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [user, lessonId]);

  const lesson = useMemo(() => {
    if (!lessonId) return null;
    return lessons.find(l => l.id === lessonId);
  }, [lessons, lessonId]);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId || !user) return;

      try {
        setCheckingAccess(true);
        
        // First check course access if it's a course lesson
        if (location.pathname.includes('/courses/')) {
          const courseId = location.pathname.split('/courses/')[1]?.split('/')[0];
          if (courseId && courseId !== 'free') {
            const hasAccess = await courseApi.checkCourseAccess(user.id, courseId);
            setHasAccess(hasAccess);
            
            if (!hasAccess) {
              toast.error('You do not have access to this lesson. Please purchase the course to continue.');
              navigate('/courses');
              return;
            }
          } else {
            setHasAccess(true); // Free lessons are accessible to all
          }
        } else {
          setHasAccess(true); // Standalone lessons are accessible to all
        }

        // Try to fetch from standalone lessons first
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();

        if (!lessonError && lessonData) {
          useLessonStore.setState(state => ({
            ...state,
            lessons: state.lessons.some(l => l.id === lessonData.id)
              ? state.lessons
              : [...state.lessons, lessonData]
          }));
          setCheckingAccess(false);
          return;
        }

        // If not found, try to fetch from course lessons
        const { data: courseLessonData, error: courseLessonError } = await supabase
          .from('course_lessons')
          .select(`
            id,
            title,
            description,
            image_url,
            video_url,
            difficulty,
            target_area,
            duration,
            instructions,
            benefits,
            category
          `)
          .eq('id', lessonId)
          .single();

        if (courseLessonError) throw courseLessonError;

        if (courseLessonData) {
          useLessonStore.setState(state => ({
            ...state,
            lessons: state.lessons.some(l => l.id === courseLessonData.id)
              ? state.lessons
              : [...state.lessons, courseLessonData]
          }));
        }
      } catch (error) {
        console.error('Error fetching lesson data:', error);
        toast.error('Failed to load lesson. Please try again.');
        navigate('/');
      } finally {
        setCheckingAccess(false);
      }
    };

    fetchLessonData();
  }, [lessonId, user, location.pathname]);

  useEffect(() => {
    if (lesson) {
      const minutes = parseInt(lesson.duration.split(' ')[0]);
      setTimeLeft(minutes * 60);
    }
  }, [lesson]);

  useEffect(() => {
    let timer: number;

    if (isStarted && !isPaused && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => window.clearInterval(timer);
  }, [isStarted, isPaused, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtube.com/watch')) {
          videoId = new URL(url).searchParams.get('v') || '';
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        } else if (url.includes('youtube.com/embed/')) {
          videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
        }
        
        if (!videoId) {
          throw new Error('Invalid YouTube URL');
        }
        
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
      }
      
      throw new Error('Unsupported video platform');
    } catch (error) {
      console.error('Error parsing video URL:', error);
      setVideoError((error as Error).message);
      return null;
    }
  };

  const handleReset = () => {
    if (lesson) {
      const minutes = parseInt(lesson.duration.split(' ')[0]);
      setTimeLeft(minutes * 60);
      setIsStarted(false);
      setIsPaused(false);
    }
  };

  const handlePlayPause = () => {
    if (!isStarted) {
      setIsStarted(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  const handleComplete = async () => {
    if (!user || !lesson || !lessonId) return;
    
    try {
      setIsCompleted(true);
      
      await Promise.all([
        trackLessonCompletion(lessonId, user.id).catch(error => {
          console.error('Error tracking lesson completion:', error);
          // Don't throw here, continue with other operations
        }),
        
        updateProfile({ 
          user_id: user.id, 
          total_practice_time: (profile?.total_practice_time || 0) + parseInt(lesson.duration)
        }).catch(error => {
          console.error('Error updating profile:', error);
          // Don't throw here, continue with other operations
        })
      ]);

      // Refresh data
      await Promise.all([
        fetchProgress(user.id),
        fetchHistory(user.id)
      ]).catch(console.error);

      toast.success('Lesson completed! Great job!');
      onComplete?.();
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Failed to save progress. Please try again.');
    }
  };

  if (checkingAccess) {
    return <div>Checking access...</div>;
  }

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <div className="mt-8 text-center">
          <Lock className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            This lesson is locked
          </h2>
          <p className="mt-2 text-gray-600">
            Purchase the course to access this lesson
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
          >
            View Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      
      <div className="mt-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative">
            {lesson.video_url ? (
              <div className="aspect-w-16 aspect-h-9">
                {videoError ? (
                  <div className="flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                      <p className="mt-2 text-gray-600">{videoError}</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={getEmbedUrl(lesson.video_url) || ''}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                )}
              </div>
            ) : (
              <div
                className="relative aspect-w-16 aspect-h-9 bg-gray-100 cursor-pointer"
                onClick={() => setShowImageModal(true)}
              >
                <img
                  src={lesson.image_url}
                  alt={lesson.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageOff className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-mint-600">
                  {formatTime(timeLeft)}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 rounded-full hover:bg-mint-50"
                  >
                    {isPaused || !isStarted ? (
                      <Play className="h-6 w-6 text-mint-600" />
                    ) : (
                      <Pause className="h-6 w-6 text-mint-600" />
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 rounded-full hover:bg-mint-50"
                  >
                    <RotateCcw className="h-6 w-6 text-mint-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                <p className="mt-2 text-gray-600">{lesson.description}</p>
              </div>

              {lesson.instructions && lesson.instructions.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Instructions</h2>
                  <ol className="mt-2 space-y-2">
                    {lesson.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-mint-100 text-mint-600 rounded-full text-sm font-medium mr-2">
                          {index + 1}
                        </span>
                        <span className="text-gray-600">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {lesson.benefits && lesson.benefits.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Benefits</h2>
                  <ul className="mt-2 space-y-2">
                    {lesson.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-mint-400 rounded-full mr-2"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={handleComplete}
                disabled={isCompleted}
                className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                  isCompleted
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-mint-500 text-white hover:bg-mint-600'
                } transition-colors`}
              >
                <CheckCircle className="h-5 w-5" />
                <span>{isCompleted ? 'Completed!' : 'Mark as Complete'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowImageModal(false)}
        >
          <div className="max-w-4xl w-full mx-4">
            <div className="relative">
              <img
                src={lesson.image_url}
                alt={lesson.title}
                className="w-full h-auto rounded-lg"
              />
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-opacity"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LessonDetails;
