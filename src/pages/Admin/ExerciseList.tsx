import React from 'react';
import { GripVertical, X, Plus } from 'lucide-react';
import type { Exercise } from '../../lib/supabase-types';

interface ExerciseListProps {
  exercises: Exercise[];
  onSelect: (id: string) => void;
  actionLabel: string;
  loading?: boolean;
  draggable?: boolean;
  onReorder?: (exercises: Exercise[]) => void;
}

function ExerciseList({
  exercises,
  onSelect,
  actionLabel,
  loading = false,
  draggable = false,
  onReorder
}: ExerciseListProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex === dropIndex || !onReorder) return;

    const newExercises = [...exercises];
    const [removed] = newExercises.splice(dragIndex, 1);
    newExercises.splice(dropIndex, 0, removed);
    onReorder(newExercises);
  };

  return (
    <div className="space-y-2">
      {exercises.map((exercise, index) => (
        <div
          key={exercise.id}
          draggable={draggable}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {draggable && (
              <GripVertical className="w-5 h-5 text-gray-400 cursor-move flex-shrink-0" />
            )}
            <img
              src={exercise.image_url}
              alt={exercise.title}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div>
              <h5 className="font-medium text-gray-900">{exercise.title}</h5>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{exercise.duration}</span>
                <span>•</span>
                <span>{exercise.difficulty}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelect(exercise.id)}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              actionLabel === 'Remove'
                ? 'text-red-600 hover:bg-red-50'
                : 'bg-mint-500 text-white hover:bg-mint-600'
            } disabled:opacity-50 flex items-center space-x-1`}
          >
            {actionLabel === 'Remove' ? (
              <X className="w-5 h-5" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>{actionLabel}</span>
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

export default ExerciseList;