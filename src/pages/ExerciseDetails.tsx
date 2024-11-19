import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, RotateCcw, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useExerciseStore } from '../store/exerciseStore';
import { useProfileStore } from '../store/profileStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

function ExerciseDetails() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfileStore();
  const { exercises, fetchExercises } = useExerciseStore();
  
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const exercise = exercises.find(ex => ex.id === exerciseId);

  useEffect(() => {
    if (exercise) {
      const minutes = parseInt(exercise.duration.split(' ')[0]);
      setTimeLeft(minutes * 60);
    }
  }, [exercise]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isStarted && !isPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isStarted, isPaused, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    try {
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
        throw new Error('Invalid YouTube URL');
      }

      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
    } catch (error) {
      setVideoError('Invalid video URL. Please check the URL and try again.');
      return null;
    }
  };

  const handleStart = () => {
    setIsStarted(true);
    setIsPaused(false);
    toast.success('Exercise started!');
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    if (exercise) {
      const minutes = parseInt(exercise.duration.split(' ')[0]);
      setTimeLeft(minutes * 60);
      setIsPaused(false);
    }
  };

  const handleComplete = async () => {
    if (!user || !profile || !exercise) return;

    try {
      // Get duration in minutes from exercise
      const duration = parseInt(exercise.duration.split(' ')[0]);

      // Create exercise history entry
      const { error: historyError } = await supabase
        .from('exercise_history')
        .insert({
          user_id: user.id,
          exercise_id: exercise.id,
          duration: duration
        });

      if (historyError) throw historyError;

      // Update user profile
      await updateProfile({
        user_id: user.id,
        email: user.email!,
        exercises_done: (profile.exercises_done || 0) + 1,
        practice_time: (profile.practice_time || 0) + duration
      });

      setIsCompleted(true);
      toast.success('Exercise completed! Great job!');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Exercise not found</p>
      </div>
    );
  }

  const embedUrl = exercise.video_url ? getEmbedUrl(exercise.video_url) : null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => {
            const fromCourse = location.state?.fromCourse;
            navigate(fromCourse ? `/courses/${fromCourse}` : '/exercises');
          }}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{exercise.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Exercise Image */}
          <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden bg-gray-100">
            <img
              src={exercise.image_url}
              alt={exercise.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Video Player */}
          {embedUrl && (
            <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden bg-gray-100">
              <iframe
                src={embedUrl}
                title={`${exercise.title} video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          {videoError && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <p>{videoError}</p>
            </div>
          )}

          {/* Timer and Controls */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="text-4xl font-bold text-center text-mint-600">
              {formatTime(timeLeft)}
            </div>

            <div className="flex justify-center space-x-4">
              {!isStarted ? (
                <button
                  onClick={handleStart}
                  className="px-6 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Exercise</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePause}
                    className="p-2 text-mint-600 hover:text-mint-700 rounded-lg hover:bg-mint-50"
                  >
                    {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 text-mint-600 hover:text-mint-700 rounded-lg hover:bg-mint-50"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {isStarted && (
              <button
                onClick={handleComplete}
                disabled={isCompleted}
                className={`w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${
                  isCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-mint-500 text-white hover:bg-mint-600'
                } transition-colors`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>{isCompleted ? 'Completed!' : 'Mark as Complete'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Exercise Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{exercise.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h3>
              <ol className="space-y-2">
                {exercise.instructions?.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-mint-100 text-mint-600 rounded-full text-sm font-medium mr-2">
                      {index + 1}
                    </span>
                    <span className="text-gray-600">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Benefits</h3>
              <ul className="space-y-2">
                {exercise.benefits?.map((benefit, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-mint-400 rounded-full mr-2"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium mr-2">Duration:</span>
                {exercise.duration}
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Target Area:</span>
                {exercise.target_area}
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Difficulty:</span>
                {exercise.difficulty}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExerciseDetails;