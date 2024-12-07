import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { courseApi } from '../lib/courses';
import { CourseAccess } from '../lib/supabase-types';
import { Loader2 } from 'lucide-react';
import { formatDisplayPrice } from '../stripe/config';
import { supabase } from '../lib/supabase';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [courseAccess, setCourseAccess] = React.useState<CourseAccess[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUserCourses = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const access = await courseApi.fetchUserCourseAccess(user.id);
        setCourseAccess(access);
      } catch (error: any) {
        console.error('Error fetching user courses:', error);
        setError(error.message || 'Failed to load your courses');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCourses();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-mint-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="text-mint-600 hover:text-mint-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>

      {courseAccess.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900 mb-4">
            You haven't purchased any courses yet
          </h2>
          <p className="text-gray-600 mb-6">
            Browse our courses and start your face yoga journey today!
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mint-600 hover:bg-mint-700"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseAccess.map((access) => (
            <div
              key={access.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {access.course?.image_url && (
                <img
                  src={access.course.image_url}
                  alt={access.course.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">
                  {access.course?.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {access.course?.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mint-100 text-mint-800">
                    {access.access_type}
                  </span>
                  {access.expires_at && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Expires: {new Date(access.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <Link
                  to={`/courses/${access.course_id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mint-600 hover:bg-mint-700 w-full justify-center"
                >
                  Continue Learning
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
