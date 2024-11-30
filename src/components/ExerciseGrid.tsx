import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { Exercise } from '../lib/supabase-types';
import { courseApi } from '../lib/courses';
import { supabase } from '../lib/supabase';
import ExerciseCard from './ExerciseCard';

interface ExerciseGridProps {
  exercises: Exercise[];
  onStartExercise: (id: string) => void;
}

function ExerciseGrid({ exercises, onStartExercise }: ExerciseGridProps) {
  const { user } = useAuth();
  const [exerciseAccess, setExerciseAccess] = useState<Record<string, { isLocked: boolean; courseTitle?: string }>>({});

  useEffect(() => {
    const checkExercisesAccess = async () => {
      if (!user || exercises.length === 0) {
        return;
      }

      const access: Record<string, { isLocked: boolean; courseTitle?: string }> = {};

      // Get all section exercises to find course relationships
      const { data: sectionExercises } = await supabase
        .from('section_exercises')
        .select(`
          exercise_id,
          section:course_sections(
            course:courses(
              id,
              title
            )
          )
        `)
        .in('exercise_id', exercises.map(e => e.id));

      // Check access for each exercise
      for (const exercise of exercises) {
        const exerciseSection = sectionExercises?.find(se => se.exercise_id === exercise.id);
        
        if (!exerciseSection || !exerciseSection.section?.course) {
          // If exercise is not in any course section, it's free
          access[exercise.id] = { isLocked: false };
          continue;
        }

        const hasAccess = await courseApi.hasAccessToExercise(user.id, exercise.id);
        access[exercise.id] = {
          isLocked: !hasAccess,
          courseTitle: exerciseSection.section.course.title
        };
      }

      setExerciseAccess(access);
    };

    checkExercisesAccess();
  }, [user, exercises]);

  if (!exercises || exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No exercises found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className="text-sm text-gray-600">Filter by:</span>
          <button className="px-3 py-1 text-sm bg-mint-500 text-white rounded-full">All</button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">Free</button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">Premium</button>
        </div>
        <div className="text-sm text-gray-600">
          {exercises.length} exercises found
        </div>
      </div>

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
            isLocked={exerciseAccess[exercise.id]?.isLocked}
            courseTitle={exerciseAccess[exercise.id]?.courseTitle}
          />
        ))}
      </div>
    </div>
  );
}

export default ExerciseGrid;