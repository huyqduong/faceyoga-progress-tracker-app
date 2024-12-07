import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useExerciseStore } from '../store/exerciseStore';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Exercise } from '../types';
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

  const handleStartExercise = async (exercise: Exercise) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // If the exercise is premium and user doesn't have active subscription
    if (exercise.is_premium && user.subscription_status !== 'active') {
      // Get course info using supabase client
      const { data: sectionExercises, error } = await supabase
        .from('section_exercises')
        .select(`
          section:course_sections(
            course_id
          )
        `)
        .eq('exercise_id', exercise.id);

      if (error) {
        console.error('Error finding exercise courses:', error);
        return;
      }

      // Find first section with a valid course_id
      const courseSection = sectionExercises?.find(se => se.section?.course_id);
      
      if (courseSection?.section?.course_id) {
        navigate(`/courses/${courseSection.section.course_id}`);
      } else {
        navigate('/courses');
      }
      return;
    }

    // User has access (either free exercise or premium user)
    navigate(`/exercises/${exercise.id}`);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Face Yoga Exercises
          </h1>
          <p className="text-lg text-gray-600">
            Choose from our collection of targeted exercises designed to tone and rejuvenate your facial muscles.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="w-full sm:w-96">
              <ExerciseSearch value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 whitespace-nowrap">Access:</span>
              <button
                onClick={() => setAccessFilter('all')}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  accessFilter === 'all'
                    ? 'bg-mint-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAccessFilter('free')}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  accessFilter === 'free'
                    ? 'bg-mint-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setAccessFilter('premium')}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  accessFilter === 'premium'
                    ? 'bg-mint-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Premium
              </button>
            </div>
          </div>

          <ExerciseFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Failed to load exercises. Please try again.
            </div>
          )}

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-mint-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600">Loading exercises...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Available Exercises
                </h2>
                <span className="text-sm text-gray-600">
                  {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'} found
                </span>
              </div>

              <ExerciseGrid 
                exercises={exercises.filter((exercise) => {
                  const matchesSearch = searchQuery === '' || 
                    exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  const matchesAccess = accessFilter === 'all' || 
                    (accessFilter === 'free' && !exercise.is_premium) ||
                    (accessFilter === 'premium' && exercise.is_premium);
                  
                  return matchesSearch && matchesAccess;
                })}
                onStartExercise={handleStartExercise}
                hasAccessToExercise={(exercise) => !exercise.is_premium || (user?.subscription_status === 'active')}
              />
            </>
          )}

          {hasMore && (
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              <div className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-mint-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600">Loading more exercises...</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-mint-50 to-mint-100 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Need Help Getting Started?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our AI coach can help you create a personalized exercise routine based on your goals and current fitness level.
          </p>
          <button 
            onClick={() => navigate('/coaching')}
            className="inline-flex items-center px-6 py-3 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors shadow-sm hover:shadow-md"
          >
            <Play className="w-5 h-5 mr-2" />
            Get Personalized Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default Exercises;