import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { useExerciseSessionStore } from '../store/exerciseSessionStore';

function ExerciseSession() {
  const { currentExercise, isActive, endExercise } = useExerciseSessionStore();
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (currentExercise) {
      const minutes = parseInt(currentExercise.duration.split(' ')[0]);
      setTimeLeft(minutes * 60);
    }
  }, [currentExercise]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive && !isPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, isPaused, timeLeft]);

  if (!currentExercise || !isActive) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    const minutes = parseInt(currentExercise.duration.split(' ')[0]);
    setTimeLeft(minutes * 60);
    setIsPaused(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white border-t border-mint-100 shadow-lg transition-all duration-300"
         style={{ maxHeight: showDetails ? '80vh' : '5rem' }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={currentExercise.image_url}
              alt={currentExercise.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-medium text-gray-900">{currentExercise.title}</h3>
              <p className="text-sm text-gray-600">{currentExercise.target_area}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-mint-600">
              {formatTime(timeLeft)}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 rounded-full hover:bg-mint-50"
              >
                {isPaused ? (
                  <Play className="w-6 h-6 text-mint-600" />
                ) : (
                  <Pause className="w-6 h-6 text-mint-600" />
                )}
              </button>

              <button
                onClick={handleReset}
                className="p-2 rounded-full hover:bg-mint-50"
              >
                <RotateCcw className="w-6 h-6 text-mint-600" />
              </button>

              <button
                onClick={endExercise}
                className="p-2 rounded-full hover:bg-red-50"
              >
                <X className="w-6 h-6 text-red-600" />
              </button>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 rounded-full hover:bg-mint-50"
              >
                {showDetails ? (
                  <ChevronDown className="w-6 h-6 text-mint-600" />
                ) : (
                  <ChevronUp className="w-6 h-6 text-mint-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
            {currentExercise.video_url && (
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <iframe
                  src={currentExercise.video_url}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentExercise.instructions && currentExercise.instructions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Instructions</h4>
                  <ol className="space-y-2">
                    {currentExercise.instructions.map((instruction, index) => (
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

              {currentExercise.benefits && currentExercise.benefits.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Benefits</h4>
                  <ul className="space-y-2">
                    {currentExercise.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-mint-400 rounded-full mr-2"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExerciseSession;