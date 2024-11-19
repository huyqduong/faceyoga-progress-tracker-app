import React from 'react';
import { Play, Clock, Target } from 'lucide-react';

interface ExerciseCardProps {
  title: string;
  duration: string;
  targetArea: string;
  description: string;
  imageUrl: string;
  difficulty: string;
  instructions?: string[];
  benefits?: string[];
  onStart: () => void;
}

function ExerciseCard({
  title,
  duration,
  targetArea,
  description,
  imageUrl,
  difficulty,
  instructions = [],
  benefits = [],
  onStart
}: ExerciseCardProps) {
  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'text-green-500 bg-green-50';
      case 'intermediate':
        return 'text-yellow-500 bg-yellow-50';
      case 'advanced':
        return 'text-red-500 bg-red-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-mint-100 overflow-hidden hover:shadow-md transition-all">
      <div className="relative">
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-mint-500" />
            {duration}
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-1 text-mint-500" />
            {targetArea}
          </div>
        </div>

        <p className="text-gray-600 line-clamp-2">{description}</p>

        {benefits && benefits.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {benefits.slice(0, 2).map((benefit, index) => (
              <span key={index} className="px-2 py-1 bg-mint-50 text-mint-600 rounded-full text-xs">
                {benefit}
              </span>
            ))}
            {benefits.length > 2 && (
              <span className="px-2 py-1 bg-mint-50 text-mint-600 rounded-full text-xs">
                +{benefits.length - 2} more
              </span>
            )}
          </div>
        )}

        <button
          onClick={onStart}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Start Exercise</span>
        </button>
      </div>
    </div>
  );
}

export default ExerciseCard;