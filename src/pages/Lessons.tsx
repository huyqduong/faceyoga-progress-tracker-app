import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useLessonStore } from '../store/lessonStore';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Lesson } from '../types';
import LessonSearch from '../components/LessonSearch';
import LessonFilter from '../components/LessonFilter';
import LessonGrid from '../components/LessonGrid';
import { courseApi } from '../lib/courses';

type AccessFilter = 'all' | 'free' | 'premium';

function Lessons() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lessons, loading, error, fetchLessons, fetchLessonsByCategory, reset, loadMore, hasMore } = useLessonStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
  const { user } = useAuth();

  useEffect(() => {
    // Reset the store when changing categories
    reset();
    
    if (selectedCategory === 'all') {
      fetchLessons();
    } else {
      fetchLessonsByCategory(selectedCategory);
    }
  }, [selectedCategory, fetchLessons, fetchLessonsByCategory, reset]);

  useEffect(() => {
    // Check if there's a lesson to start
    const startLessonId = searchParams.get('start');
    if (startLessonId) {
      navigate(`/lesson/${startLessonId}`);
    }
  }, [searchParams, navigate]);

  const handleStartLesson = async (lesson: Lesson) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Check if user has access to this lesson
      const hasAccess = await courseApi.hasAccessToLesson(user.id, lesson.id);
      
      if (!hasAccess) {
        // Get course info using supabase client
        const { data: sectionLessons, error } = await supabase
          .from('section_lessons')
          .select(`
            section:course_sections(
              course_id
            )
          `)
          .eq('lesson_id', lesson.id)
          .single();

        if (error) {
          console.error('Error finding lesson courses:', error);
          navigate('/courses'); // Fallback to courses page
          return;
        }

        // Redirect to course if found, otherwise to courses page
        if (sectionLessons?.section?.course_id) {
          navigate(`/courses/${sectionLessons.section.course_id}`);
        } else {
          navigate('/courses');
        }
        return;
      }

      // For free lessons or lessons user has access to
      const { data: sectionLessons } = await supabase
        .from('section_lessons')
        .select(`
          section:course_sections(
            course_id
          )
        `)
        .eq('lesson_id', lesson.id)
        .maybeSingle();

      // If lesson belongs to a course, use course route, otherwise use direct lesson route
      if (sectionLessons?.section?.course_id) {
        navigate(`/courses/${sectionLessons.section.course_id}/lessons/${lesson.id}`);
      } else {
        // For free lessons not in any course
        navigate(`/courses/free/lessons/${lesson.id}`);
      }
    } catch (error) {
      console.error('Error checking lesson access:', error);
      navigate('/courses'); // Fallback to courses page
    }
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
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Face Yoga Lessons</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Explore our collection of face yoga lessons to enhance your practice
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-start justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
        <div className="flex-1 max-w-md">
          <LessonSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search lessons..."
          />
        </div>
        <LessonFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          accessFilter={accessFilter}
          onAccessFilterChange={setAccessFilter}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-500 dark:border-mint-400"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="inline-flex items-center px-4 py-2 rounded-md text-sm text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900/20">
            <span>Failed to load lessons. Please try again.</span>
          </div>
        </div>
      )}

      {/* Lessons Grid */}
      {!loading && !error && (
        <>
          <LessonGrid
            lessons={lessons.filter(lesson => {
              const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lesson.description.toLowerCase().includes(searchQuery.toLowerCase());

              let matchesAccess = true;
              if (accessFilter === 'free') {
                matchesAccess = !lesson.section_lessons || lesson.section_lessons.length === 0;
              } else if (accessFilter === 'premium') {
                matchesAccess = lesson.section_lessons && lesson.section_lessons.length > 0;
              }

              return matchesSearch && matchesAccess;
            })}
            onStartLesson={handleStartLesson}
            hasAccessToLesson={async (lesson) => {
              if (!user) return !lesson.is_premium;
              try {
                return await courseApi.hasAccessToLesson(user.id, lesson.id);
              } catch (error) {
                console.error('Error checking lesson access:', error);
                return false;
              }
            }}
          />

          {/* Load More */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="flex justify-center py-4"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-500 dark:border-mint-400"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Lessons;