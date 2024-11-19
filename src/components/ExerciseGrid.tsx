import React from 'react';
import type { Exercise } from '../lib/supabase-types';
import ExerciseCard from './ExerciseCard';

interface ExerciseGridProps {
  exercises: Exercise[];
  onStartExercise: (id: string) => void;
}

function ExerciseGrid({ exercises, onStartExercise }: ExerciseGridProps) {
  if (!exercises || exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No exercises found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          title={exercise.title}
          duration={exercise.duration}
          targetArea={exercise.target_area}
          description={exercise.description}
          imageUrl={exercise.image_url}
          difficulty={exercise.difficulty}
          instructions={exercise.instructions || []}
          benefits={exercise.benefits || []}
          onStart={() => onStartExercise(exercise.id)}
        />
      ))}
    </div>
  );
}

export default ExerciseGrid;