import React, { useEffect, useState } from 'react';
import { courseApi } from '../lib/courses';
import { useAuthStore } from '../store/authStore';
import { Course, CoursePurchase } from '../lib/supabase-types';
import toast from 'react-hot-toast';

export const CoursePurchaseTest = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [purchases, setPurchases] = useState<CoursePurchase[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const coursesList = await courseApi.fetchCourses();
      setCourses(coursesList);

      if (user) {
        const purchasesList = await courseApi.fetchUserPurchases(user.id);
        setPurchases(purchasesList);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading data');
    }
  };

  const simulatePurchase = async (course: Course) => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    try {
      // Create a test purchase record
      const purchase = await courseApi.createPurchase({
        user_id: user.id,
        course_id: course.id,
        amount: course.price,
        currency: course.currency,
        status: 'pending',
        payment_intent_id: `test_${Date.now()}`,
        payment_method: 'test',
      });

      // Simulate successful payment
      const updatedPurchase = await courseApi.updatePurchaseStatus(
        purchase.id,
        'completed',
        'https://example.com/receipt'
      );

      // Grant course access
      await courseApi.grantCourseAccess({
        user_id: user.id,
        course_id: course.id,
        purchase_id: purchase.id,
        access_type: 'lifetime',
        starts_at: new Date().toISOString(),
      });

      toast.success('Purchase successful! You now have access to this course.');

      // Reload data
      loadData();
    } catch (error) {
      console.error('Error purchasing course:', error);
      toast.error('Error purchasing course');
    }
  };

  const checkAccess = async (course: Course) => {
    if (!user) return;

    try {
      const hasAccess = await courseApi.hasAccessToCourse(user.id, course.id);
      toast.success(
        hasAccess ? 'You have access to this course!' : 'You need to purchase this course first.'
      );
    } catch (error) {
      console.error('Error checking access:', error);
      toast.error('Error checking access');
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-600">Please sign in to test course purchases.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Course Purchase Test</h2>
      
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Available Courses:</h3>
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-gray-900">{course.title}</h4>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {course.price} {course.currency}
              </span>
            </div>
            <p className="text-gray-600">{course.description}</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => simulatePurchase(course)}
                className="px-4 py-2 bg-mint-500 text-white rounded-md hover:bg-mint-600 transition-colors"
              >
                Purchase
              </button>
              <button 
                onClick={() => checkAccess(course)}
                className="px-4 py-2 border border-mint-500 text-mint-600 rounded-md hover:bg-mint-50 transition-colors"
              >
                Check Access
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 mt-8">Your Purchases:</h3>
        {purchases.map(purchase => (
          <div key={purchase.id} className="bg-white rounded-lg shadow p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-gray-900">{purchase.course?.title}</h4>
              <span className={`px-2 py-1 rounded-full text-sm font-medium
                ${purchase.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  purchase.status === 'refunded' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'}`}
              >
                {purchase.status}
              </span>
            </div>
            <p className="text-gray-600">
              Amount: {purchase.amount} {purchase.currency}
            </p>
            <p className="text-gray-600">
              Purchased: {new Date(purchase.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
