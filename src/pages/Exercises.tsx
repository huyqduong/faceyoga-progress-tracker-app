import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useExerciseStore } from '../store/exerciseStore';
import ExerciseSearch from '../components/ExerciseSearch';
import ExerciseFilter from '../components/ExerciseFilter';
import ExerciseGrid from '../components/ExerciseGrid';

function Exercises() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { exercises, loading, error, fetchExercises, fetchExercisesByCategory } = useExerciseStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedCategory === 'all') {
      fetchExercises();
    } else {
      fetchExercisesByCategory(selectedCategory);
    }
  }, [selectedCategory, fetchExercises, fetchExercisesByCategory]);

  useEffect(() => {
    // Check if there's an exercise to start
    const startExerciseId = searchParams.get('start');
    if (startExerciseId) {
      navigate(`/exercises/${startExerciseId}`);
    }
  }, [searchParams, navigate]);

  const filteredExercises = exercises.filter((exercise) =>
    exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartExercise = (id: string) => {
    navigate(`/exercises/${id}`);
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Face Yoga Exercises</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from our collection of targeted exercises designed to tone and rejuvenate your facial muscles.
        </p>
      </header>

      <div className="space-y-4">
        <ExerciseSearch value={searchQuery} onChange={setSearchQuery} />
        <ExerciseFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Failed to load exercises. Please try again.
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading exercises...</p>
        </div>
      ) : (
        <ExerciseGrid exercises={filteredExercises} onStartExercise={handleStartExercise} />
      )}

      <div className="bg-mint-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Help Getting Started?</h2>
        <p className="text-gray-600 mb-6">
          Our AI coach can help you create a personalized exercise routine based on your goals.
        </p>
        <button 
          onClick={() => navigate('/coaching')}
          className="inline-flex items-center px-6 py-3 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
        >
          <Play className="w-5 h-5 mr-2" />
          Get Personalized Plan
        </button>
      </div>
    </div>
  );
}

export default Exercises;