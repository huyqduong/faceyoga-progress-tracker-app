import React, { useState, useEffect } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';
import { useExerciseStore } from '../../store/exerciseStore';
import ExerciseList from './ExerciseList';
import type { Exercise } from '../../lib/supabase-types';

interface SectionExerciseManagerProps {
  sectionId: string;
}

function SectionExerciseManager({ sectionId }: SectionExerciseManagerProps) {
  const { exercises: allExercises, fetchExercises } = useExerciseStore();
  const { 
    exercises: sectionExercises, 
    loading,
    error: storeError,
    fetchSectionExercises, 
    addExerciseToSection, 
    removeExerciseFromSection,
    reorderSectionExercises 
  } = useCourseStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchExercises(),
          fetchSectionExercises(sectionId)
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exercises');
      }
    };
    loadData();
  }, [sectionId, fetchExercises, fetchSectionExercises]);

  const currentExercises = sectionExercises[sectionId] || [];
  const currentExerciseIds = new Set(currentExercises.map(e => e.exercise_id));

  const filteredExercises = allExercises.filter(exercise => 
    !currentExerciseIds.has(exercise.id) &&
    (exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     exercise.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddExercise = async (exerciseId: string) => {
    try {
      setError(null);
      await addExerciseToSection(sectionId, exerciseId, currentExercises.length);
      await fetchSectionExercises(sectionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add exercise');
    }
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    try {
      setError(null);
      await removeExerciseFromSection(sectionId, exerciseId);
      await fetchSectionExercises(sectionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove exercise');
    }
  };

  const handleReorder = async (reorderedExercises: Exercise[]) => {
    try {
      setError(null);
      await reorderSectionExercises(
        sectionId, 
        reorderedExercises.map(e => e.id)
      );
      await fetchSectionExercises(sectionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder exercises');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading exercises...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Section Exercises</h4>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
        >
          {isAdding ? (
            <>
              <X className="w-5 h-5 inline-block mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 inline-block mr-2" />
              Add Exercise
            </>
          )}
        </button>
      </div>

      {(error || storeError) && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error || storeError}
        </div>
      )}

      {isAdding && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <ExerciseList
            exercises={filteredExercises}
            onSelect={handleAddExercise}
            actionLabel="Add"
            loading={loading}
          />
        </div>
      )}

      {currentExercises.length > 0 ? (
        <ExerciseList
          exercises={currentExercises.map(se => se.exercise!).filter(Boolean)}
          onSelect={handleRemoveExercise}
          actionLabel="Remove"
          loading={loading}
          draggable
          onReorder={handleReorder}
        />
      ) : (
        <p className="text-center py-8 text-gray-500">
          No exercises added to this section yet.
        </p>
      )}
    </div>
  );
}

export default SectionExerciseManager;