import React, { useEffect } from 'react';
import { useExerciseStore } from '../store/exerciseStore';

interface ExerciseSelectorProps {
  selectedExercises: string[];
  onChange: (exercises: string[]) => void;
}

function ExerciseSelector({ selectedExercises, onChange }: ExerciseSelectorProps) {
  const { exercises, fetchExercises } = useExerciseStore();

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleToggleExercise = (exerciseId: string) => {
    const newSelection = selectedExercises.includes(exerciseId)
      ? selectedExercises.filter(id => id !== exerciseId)
      : [...selectedExercises, exerciseId];
    onChange(newSelection);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Exercises ({selectedExercises.length} selected)
      </label>
      <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-lg bg-white">
        {exercises.map((exercise) => (
          <label
            key={exercise.id}
            className={`flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer ${
              selectedExercises.includes(exercise.id) ? 'bg-mint-50' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={selectedExercises.includes(exercise.id)}
              onChange={() => handleToggleExercise(exercise.id)}
              className="rounded border-gray-300 text-mint-600 focus:ring-mint-500"
            />
            <div className="flex items-center space-x-3 flex-1">
              <img
                src={exercise.image_url}
                alt={exercise.title}
                className="w-10 h-10 rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{exercise.title}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{exercise.duration}</span>
                  <span>•</span>
                  <span>{exercise.difficulty}</span>
                </div>
              </div>
            </div>
          </label>
        ))}

        {exercises.length === 0 && (
          <p className="text-center text-gray-500 py-2">
            No exercises available. Create some exercises first.
          </p>
        )}
      </div>
    </div>
  );
}

export default ExerciseSelector;