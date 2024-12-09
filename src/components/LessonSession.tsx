import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { Lesson } from '../types';
import { useProgressStore } from '../store/progressStore';

interface LessonSessionProps {
  lesson: Lesson;
  onComplete: () => void;
}

function LessonSession({ lesson, onComplete }: LessonSessionProps) {
  const navigate = useNavigate();
  const { addProgress } = useProgressStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(lesson.duration * 60); // Convert minutes to seconds
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setIsComplete(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const handleComplete = async () => {
    await addProgress({
      lesson_id: lesson.id,
      completed_at: new Date().toISOString(),
      duration: lesson.duration,
    });
    onComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((lesson.duration * 60 - timeLeft) / (lesson.duration * 60)) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-xl mx-auto">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
          <p className="text-gray-600">{lesson.description}</p>
        </div>

        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-mint-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-2xl font-semibold text-gray-900">{formatTime(timeLeft)}</span>
          <div className="space-x-4">
            {!isComplete ? (
              <>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="inline-flex items-center px-4 py-2 rounded-lg font-medium bg-mint-500 text-white hover:bg-mint-600 transition-colors"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {timeLeft === lesson.duration * 60 ? 'Start' : 'Resume'}
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setTimeLeft(lesson.duration * 60);
                    setIsPlaying(false);
                  }}
                  className="inline-flex items-center px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </button>
              </>
            ) : (
              <button
                onClick={handleComplete}
                className="inline-flex items-center px-4 py-2 rounded-lg font-medium bg-mint-500 text-white hover:bg-mint-600 transition-colors"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete Lesson
              </button>
            )}
          </div>
        </div>

        {lesson.video_url && (
          <div className="aspect-video w-full">
            <iframe
              src={lesson.video_url}
              title={lesson.title}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonSession;