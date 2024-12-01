import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Course, CourseSection } from '../lib/supabase-types';
import { courseApi } from '../lib/courses';
import { CoursePurchaseButton } from '../components/CoursePurchaseButton';
import { Loader2, PlayCircle, Lock } from 'lucide-react';
import { formatDisplayPrice } from '../stripe/config';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export const CourseDetailsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = React.useState<Course | null>(null);
  const [sections, setSections] = React.useState<CourseSection[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasAccess, setHasAccess] = React.useState(false);

  const loadCourseData = React.useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const courseData = await courseApi.getCourseById(courseId);
      const sectionsData = await courseApi.getCourseSections(courseId);
      
      setCourse(courseData);
      setSections(sectionsData);

      // Check course access
      if (user) {
        const { data: accessData } = await supabase
          .from('course_access')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();
        
        setHasAccess(!!accessData);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  React.useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const handlePurchaseComplete = () => {
    loadCourseData(); // Refresh the page data to update access status
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-8">Course not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="relative">
          {course.image_url && (
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-lg opacity-90">{course.description}</p>
          </div>
        </div>

        {/* Course Info */}
        <div className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <span className="text-sm font-medium">
                Difficulty: {course.difficulty}
              </span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <span className="text-sm font-medium">
                Duration: {course.duration}
              </span>
            </div>
            <div className="flex items-center bg-mint-100 rounded-full px-4 py-2">
              <span className="text-sm font-medium text-mint-700">
                Price: {formatDisplayPrice(course.price)}
              </span>
            </div>
          </div>

          {/* Purchase or Access Button */}
          <div className="mb-8">
            <CoursePurchaseButton
              course={course}
              onPurchaseComplete={handlePurchaseComplete}
            />
          </div>

          {/* Course Sections */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-6">Course Content</h2>
            {sections.length > 0 ? (
              <div className="space-y-4">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={`p-4 rounded-lg border ${
                      hasAccess ? 'border-mint-200 bg-mint-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg">{section.title}</h3>
                      {hasAccess ? (
                        <Link
                          to={`/course/${courseId}/section/${section.id}`}
                          className="flex items-center text-mint-600 hover:text-mint-700"
                        >
                          <PlayCircle className="w-5 h-5 mr-1" />
                          <span>Start Learning</span>
                        </Link>
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <Lock className="w-5 h-5 mr-1" />
                          <span>Purchase to Access</span>
                        </div>
                      )}
                    </div>
                    {section.description && (
                      <p className="text-gray-600 mt-2">{section.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No sections available yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
