import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { useAuth } from '../hooks/useAuth';
import { useLessonStore } from '../store/lessonStore';
import { useProgressStore } from '../store/progressStore';
import { useLessonHistoryStore } from '../store/lessonHistoryStore';
import { useProfileStore } from '../store/profileStore';
import { useGoalProgressStore } from '../store/goalProgressStore';
import { AlertCircle, Play, Pause, RotateCcw, ImageOff, Lock, CheckCircle, X, Check } from 'lucide-react';
import { vimeoService } from '../lib/vimeo';
import BackButton from '../components/BackButton';
import toast from 'react-hot-toast';
import { courseApi } from '../api/courseApi';

interface LessonDetailsProps {
  onComplete?: () => void;
}

function LessonDetails({ onComplete }: LessonDetailsProps) {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfileStore();
  const { lessons, fetchLessons } = useLessonStore();
  const { fetchProgress } = useProgressStore();
  const { fetchHistory } = useLessonHistoryStore();
  const { trackLessonCompletion } = useGoalProgressStore();
  
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [videoPassword, setVideoPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);

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
          if (lessonData) {
            const rawLesson = lessonData as any;
            const typedLessonData: Database['public']['Tables']['lessons']['Row'] = {
              id: rawLesson.id,
              title: rawLesson.title,
              duration: rawLesson.duration,
              description: rawLesson.description,
              image_url: rawLesson.image_url,
              video_url: rawLesson.video_url,
              difficulty: rawLesson.difficulty,
              instructions: rawLesson.instructions || [],
              benefits: rawLesson.benefits || [],
              category: rawLesson.category,
              target_area: rawLesson.target_area,
              is_premium: rawLesson.is_premium ?? false,
              created_at: rawLesson.created_at,
              updated_at: rawLesson.updated_at
            };
            useLessonStore.setState(state => ({
              ...state,
              lessons: state.lessons.some(l => l.id === typedLessonData.id)
                ? state.lessons
                : [...state.lessons, typedLessonData]
            }));
          }
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
          if (courseLessonData) {
            const rawLesson = courseLessonData as any;
            const now = new Date().toISOString();
            const typedLessonData: Database['public']['Tables']['lessons']['Row'] = {
              id: rawLesson.id,
              title: rawLesson.title,
              duration: rawLesson.duration,
              description: rawLesson.description,
              image_url: rawLesson.image_url,
              video_url: rawLesson.video_url,
              difficulty: rawLesson.difficulty,
              instructions: rawLesson.instructions || [],
              benefits: rawLesson.benefits || [],
              category: rawLesson.category,
              target_area: rawLesson.target_area,
              is_premium: false,
              created_at: now,
              updated_at: now
            };
            useLessonStore.setState(state => ({
              ...state,
              lessons: state.lessons.some(l => l.id === typedLessonData.id)
                ? state.lessons
                : [...state.lessons, typedLessonData]
            }));
          }
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

  const getEmbedUrl = async (videoUrl: string): Promise<string> => {
    try {
      console.log('Getting embed URL for:', videoUrl);
      const videoInfo = await vimeoService.getVideoInfo(videoUrl);
      
      if (!videoInfo.embedUrl) {
        throw new Error('No embed URL available for this video');
      }

      return videoInfo.embedUrl;
    } catch (error) {
      console.error('Error getting embed URL:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (lesson?.video_url) {
      console.log('Loading video for URL:', lesson.video_url);
      setVideoLoading(true);
      setVideoError(null);
      
      getEmbedUrl(lesson.video_url)
        .then(url => {
          console.log('Setting embed URL:', url);
          setEmbedUrl(url);
        })
        .catch(error => {
          console.error('Error loading video:', error);
          setVideoError(error instanceof Error ? error.message : 'Failed to load video');
        })
        .finally(() => {
          setVideoLoading(false);
        });
    } else {
      setEmbedUrl(null);
    }
  }, [lesson]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    try {
      if (!lesson || !user) {
        toast.error('Please sign in to complete lessons');
        return;
      }

      const lessonDuration = parseInt(lesson.duration);

      // Record lesson completion in history first
      const { error: historyError } = await supabase
        .from('lesson_history')
        .insert([
          {
            user_id: user.id,
            lesson_id: lesson.id,
            practice_time: lessonDuration,
            completed_at: new Date().toISOString()
          }
        ]);

      if (historyError) {
        console.error('Error recording lesson history:', historyError);
        throw historyError;
      }

      // Update profile practice time
        const { data: currentProfile, error: profileError } = await supabase
          .from('profiles')
          .select<'lessons_completed, practice_time', Pick<Database['public']['Tables']['profiles']['Row'], 'lessons_completed' | 'practice_time'>>('lessons_completed, practice_time')
          .eq('user_id', user.id)
          .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          lessons_completed: (currentProfile?.lessons_completed || 0) + 1,
          practice_time: (currentProfile?.practice_time || 0) + lessonDuration
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      // Track lesson completion for goals
      await trackLessonCompletion(lesson.id, user.id);

      // Update UI state
      setIsCompleted(true);
      toast.success('Lesson completed! Great job!');
      
      // Refresh data
      fetchHistory();
      fetchProgress();
      
      // Call completion callback if provided
      onComplete?.();
      
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Failed to complete lesson. Please try again.');
    }
  };

  const handlePasswordSubmit = async () => {
    if (!lesson?.video_url || !videoPassword) return;
    
    try {
      const videoId = lesson.video_url.split('vimeo.com/')[1]?.split('?')[0];
      if (!videoId) {
        throw new Error('Invalid video URL');
      }
      
      const success = await vimeoService.getVideoInfo(videoId);
      if (success) {
        const videoInfo = await vimeoService.getVideoInfo(lesson.video_url);
        setEmbedUrl(videoInfo.embedUrl);
        setRequiresPassword(false);
      } else {
        toast.error('Incorrect password');
      }
    } catch (error) {
      console.error('Error unlocking video:', error);
      toast.error('Failed to unlock video');
    }
  };

  if (checkingAccess) {
    return <div className="text-gray-600 dark:text-gray-300">Checking access...</div>;
  }

  if (!lesson) {
    return <div className="text-gray-600 dark:text-gray-300">Lesson not found</div>;
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
        <BackButton />
        <div className="mt-8 text-center">
          <Lock className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            This lesson is locked
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
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
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
      <BackButton />
      
      <div className="mt-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="relative">
            {/* Video Section */}
            {lesson?.video_url && (
              <div className="w-full max-w-4xl mx-auto px-4 mb-8">
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  {videoLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500 dark:border-mint-400" />
                    </div>
                  ) : videoError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="text-red-500 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{videoError}</span>
                      </div>
                    </div>
                  ) : embedUrl ? (
                    <iframe
                      src={embedUrl}
                      className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : null}
                </div>
              </div>
            )}
            {!lesson.video_url && (
              <div
                className="relative aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 cursor-pointer"
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
                    <ImageOff className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lesson.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-mint-600 dark:text-mint-400">
                  {formatTime(timeLeft)}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 rounded-full hover:bg-mint-50 dark:hover:bg-mint-900/20"
                  >
                    {isPaused || !isStarted ? (
                      <Play className="h-6 w-6 text-mint-600 dark:text-mint-400" />
                    ) : (
                      <Pause className="h-6 w-6 text-mint-600 dark:text-mint-400" />
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 rounded-full hover:bg-mint-50 dark:hover:bg-mint-900/20"
                  >
                    <RotateCcw className="h-6 w-6 text-mint-600 dark:text-mint-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h2>
                <div 
                  className="mt-2 prose prose-mint max-w-none text-gray-600 dark:text-gray-300 dark:prose-headings:text-white dark:prose-strong:text-white"
                  dangerouslySetInnerHTML={{ __html: lesson.description }}
                />
              </div>

              {lesson.instructions && lesson.instructions.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Instructions</h2>
                  <ol className="mt-2 space-y-4">
                    {lesson.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-mint-100 dark:bg-mint-900/30 text-mint-600 dark:text-mint-400 rounded-full text-sm font-medium mr-3 mt-1">
                          {index + 1}
                        </span>
                        <div 
                          className="flex-1 prose prose-mint max-w-none text-gray-600 dark:text-gray-300 dark:prose-headings:text-white dark:prose-strong:text-white"
                          dangerouslySetInnerHTML={{ __html: instruction }}
                        />
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {lesson.benefits && lesson.benefits.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Benefits</h2>
                  <ul className="mt-2 space-y-2">
                    {lesson.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="flex-shrink-0 w-5 h-5 text-mint-500 dark:text-mint-400 mr-2" />
                        <div 
                          className="flex-1 prose prose-mint max-w-none text-gray-600 dark:text-gray-300 dark:prose-headings:text-white dark:prose-strong:text-white"
                          dangerouslySetInnerHTML={{ __html: benefit }}
                        />
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
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-not-allowed'
                    : 'bg-mint-500 text-white hover:bg-mint-600 dark:hover:bg-mint-600'
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
