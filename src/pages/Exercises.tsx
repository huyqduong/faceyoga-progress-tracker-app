import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useExerciseStore } from '../store/exerciseStore';
import { useAuth } from '../hooks/useAuth';
import { courseApi } from '../lib/courses';
import ExerciseSearch from '../components/ExerciseSearch';
import ExerciseFilter from '../components/ExerciseFilter';
import ExerciseGrid from '../components/ExerciseGrid';

type AccessFilter = 'all' | 'free' | 'premium';

function Exercises() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { exercises, loading, error, fetchExercises, fetchExercisesByCategory, reset, loadMore, hasMore } = useExerciseStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
  const { user } = useAuth();

  useEffect(() => {
    // Reset the store when changing categories
    reset();
    
    if (selectedCategory === 'all') {
      fetchExercises();
    } else {
      fetchExercisesByCategory(selectedCategory);
    }
  }, [selectedCategory, fetchExercises, fetchExercisesByCategory, reset]);

  useEffect(() => {
    // Check if there's an exercise to start
    const startExerciseId = searchParams.get('start');
    if (startExerciseId) {
      navigate(`/exercises/${startExerciseId}`);
    }
  }, [searchParams, navigate]);

  const handleStartExercise = async (id: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if exercise is locked
    const hasAccess = await courseApi.hasAccessToExercise(user.id, id);
    if (!hasAccess) {
      // Get course info
      const { data: sectionExercise } = await courseApi
        .from('section_exercises')
        .select(`
          section:course_sections(
            course_id
          )
        `)
        .eq('exercise_id', id)
        .single();

      if (sectionExercise?.section?.course_id) {
        navigate(`/courses/${sectionExercise.section.course_id}`);
      } else {
        navigate('/courses');
      }
      return;
    }

    navigate(`/exercises/${id}`);
  };

  // Add intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMore, loadMore]);

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
        <ExerciseGrid 
          exercises={exercises.filter((exercise) =>
            exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          onStartExercise={handleStartExercise}
        />
      )}

      {hasMore && (
        <div ref={loadMoreRef} className="text-center py-12">
          <p className="text-gray-500">Loading more exercises...</p>
        </div>
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