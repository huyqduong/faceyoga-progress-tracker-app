import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, BookOpen, AlertCircle, Lock, ArrowRight } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import { CoursePurchaseButton } from '../components/CoursePurchaseButton';
import { useAuthStore } from '../store/authStore';
import { courseApi } from '../lib/courses';
import { toast } from 'react-hot-toast';
import type { SectionLesson } from '../lib/supabase-types';

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    courses, 
    sections,
    lessons: sectionLessons,
    loading: storeLoading,
    error: storeError,
    fetchCourses,
    fetchCourseSections,
    fetchSectionLessons,
    isLoadingCourse
  } = useCourseStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loadingSections, setLoadingSections] = useState<string[]>([]);

  // Get course data
  const course = courseId ? courses.find(c => c.id === courseId) : null;
  const courseSections = courseId && sections[courseId] ? sections[courseId] : [];

  // Load course data and check access
  const loadCourseData = useCallback(async () => {
    if (!courseId) {
      setError('Course ID is missing');
      setIsLoading(false);
      return;
    }

    if (isLoadingCourse(courseId)) {
      return;
    }
    
    try {
      // Load data in sequence to ensure dependencies are met
      if (courses.length === 0) {
        await fetchCourses();
      }

      // Fetch sections for this course
      await fetchCourseSections(courseId);
      
      // Check course access
      if (user) {
        const hasAccess = await courseApi.hasAccessToCourse(user.id, courseId);
        setHasAccess(hasAccess);
      }
    } catch (err) {
      console.error('Error loading course data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course data');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, user, courses.length, fetchCourses, fetchCourseSections, isLoadingCourse]);

  // Load section lessons
  const loadSectionLessons = useCallback(async () => {
    if (!courseSections.length) return;

    const sectionsToLoad = courseSections.filter(
      section => !sectionLessons[section.id]
    );

    if (sectionsToLoad.length === 0) return;

    setLoadingSections(sectionsToLoad.map(s => s.id));

    try {
      await Promise.all(
        sectionsToLoad.map(section => 
          fetchSectionLessons(section.id).catch(err => {
            console.error(`Error loading lessons for section ${section.id}:`, err);
            toast.error(`Failed to load lessons for section ${section.title}`);
          })
        )
      );
    } finally {
      setLoadingSections([]);
    }
  }, [courseSections, sectionLessons, fetchSectionLessons]);

  // Initial data load
  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Load lessons after sections are loaded
  useEffect(() => {
    if (!isLoading && courseSections.length > 0) {
      loadSectionLessons();
    }
  }, [isLoading, courseSections.length, loadSectionLessons]);

  const renderLesson = (item: SectionLesson) => {
    if (!item.lesson?.id || !item.lesson?.title) return null;

    return (
      <div
        key={item.id}
        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {item.lesson.image_url ? (
            <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
              <img
                src={item.lesson.image_url}
                alt={item.lesson.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-gray-400 dark:text-gray-300" />
            </div>
          )}
          <div>
            <span className="text-gray-700 dark:text-gray-100 font-medium">{item.lesson.title}</span>
            {item.lesson.duration && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                <Clock className="h-4 w-4 mr-1" />
                {item.lesson.duration}
              </div>
            )}
          </div>
          {!hasAccess && <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500 ml-2" />}
        </div>
        {hasAccess && (
          <button
            onClick={() => navigate(`/lessons/${item.lesson.id}`)}
            className="flex items-center space-x-1 text-mint-600 hover:text-mint-700 dark:text-mint-400 dark:hover:text-mint-300"
          >
            <span>Start</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 mb-4">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Courses</span>
          </button>

          {course.image_url && (
            <div className="relative w-full h-48 md:h-64 mb-6 rounded-lg overflow-hidden">
              <img
                src={course.image_url}
                alt={course.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{course.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300 mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>{course.difficulty}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>{courseSections.length} sections</span>
            </div>
          </div>

          <div 
            className="prose prose-mint max-w-none mb-6 text-gray-600 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />

          {!hasAccess && (
            <div className="mb-6">
              <CoursePurchaseButton
                courseId={course.id}
                onPurchaseComplete={() => setHasAccess(true)}
              />
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="space-y-6">
          {courseSections.map((section) => {
            const isLoading = loadingSections.includes(section.id);
            const sectionLessonList = sectionLessons[section.id] || [];

            return (
              <div
                key={section.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <h3 
                  className="text-xl font-semibold text-gray-900 dark:text-white mb-4 prose prose-mint dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.title }}
                />
                <div 
                  className="text-gray-600 dark:text-gray-300 mb-4 prose prose-mint dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.description }}
                />

                <div className="space-y-3">
                  {isLoading ? (
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
                      ))}
                    </div>
                  ) : sectionLessonList.length > 0 ? (
                    sectionLessonList.map(renderLesson)
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No lessons available</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
